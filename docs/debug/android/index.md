---
isTimeLine: true
title: Android 14 Flutter 应用抓包与逆向实战
description: 基于 Reqable + Magisk + Frida，对 Android 14 上的 Flutter 应用进行 SSL 绕过、抓包与关键鉴权参数逆向的实战记录。
date: 2026-04-08
tag:
 - Android
 - Flutter
 - SSL Pinning
 - 抓包
 - Frida
 - Magisk
 - Reqable
---

# Android 14 Flutter 应用抓包与逆向实战

记录一次 Android 14 Root 环境下，对腾讯系 Flutter 应用进行抓包与逆向定位的过程。

最终采用的链路：

```text
Reqable + Magisk 系统证书 + Frida + 反编译定位关键类
```

排查过程中测试过 `TrustMeAlready`，未产生实际效果。后续确认该应用的关键链路并不局限于 Java 层 SSL Pinning，而是同时涉及 Flutter / Native 层与应用自身的安全参数机制，后续分析转向 Frida 与反编译源码。

## 背景

### 环境

| 项目 | 配置 |
|------|------|
| 手机系统 | Android 14 |
| Root 方案 | Magisk + Zygisk |
| 抓包工具 | Reqable |
| 动态注入 | Frida |
| 目标类型 | Flutter 应用 |
| 电脑系统 | macOS |

### 目标问题

- 普通网页和普通 App 可以抓包
- 目标 App 开启抓包后无法正常拿到关键请求
- 即使拿到了部分请求，后续也会发现只靠包本身还原不出完整鉴权链路

## 工具与地址

| 工具 | 用途 | 地址 |
|------|------|------|
| Reqable | 代理抓包、HTTPS 流量观察 | [https://reqable.com/zh-CN/](https://reqable.com/zh-CN/) |
| Magisk | Root 与系统证书模块基础环境 | [https://github.com/topjohnwu/Magisk](https://github.com/topjohnwu/Magisk) |
| MagiskFrida | 通过 Magisk 安装 `frida-server` | [https://github.com/ViRb3/magisk-frida](https://github.com/ViRb3/magisk-frida) |
| Frida | 动态注入、Hook 关键类与方法 | [https://frida.re/](https://frida.re/) |
| frida-tools | PC 端 Frida 命令行工具 | [https://github.com/frida/frida-tools](https://github.com/frida/frida-tools) |
| jadx | 反编译 APK，定位关键类 | [https://github.com/skylot/jadx](https://github.com/skylot/jadx) |

## 脚本附件与参考链接

- 最小 Hook 脚本：[`android-frida-camp-security-minimal.js`](./android-frida-camp-security-minimal.js)
- Flutter SSL 绕过参考脚本：[`frida-script.js`](https://raw.githubusercontent.com/httptoolkit/frida-interception-and-unpinning/4d477da/frida-script.js)
- Frida 通用脚本仓库：[`codeshare.frida.re`](https://codeshare.frida.re/)

## 结论

可行链路如下：

1. 先用 Reqable + Magisk 解决系统证书信任问题
2. 发现 `TrustMeAlready` 对目标 App 无效
3. 确认 App 使用 Flutter，转向 Frida
4. 用 Frida 做低干扰 SSL 绕过和关键参数 Hook
5. 将抓到的结果和反编译源码对照，补齐 `encodeRes -> userKey -> encodeParam -> 响应解密` 整条链路

结论如下：

- Flutter 应用里，`TrustMeAlready` 这类 Java/Xposed 层方案未必有效
- 即使抓到 HTTPS 请求，也未必能直接复现业务接口
- 对腾讯系这类 App，更关键的是安全参数生成与响应解密链路，而不只是 HTTPS 明文抓取

## 实际排查路径

### 1. 系统证书信任

Android 7.0 以后默认不信任用户证书，因此先处理系统证书信任。

本次使用的是：

- Reqable
- Magisk 证书模块

可以先用最小检查命令确认设备和 Root 环境正常：

```bash
adb devices
adb shell getprop ro.build.version.release
adb shell su -c id
```

完成后，普通网页与普通请求可以正常抓包，说明：

- Root 环境正常
- 系统证书信任已生效
- 问题不在 Reqable 本身

后续失败点不在系统证书层，而在目标应用自身的额外校验。

### 2. `TrustMeAlready` 无效

`TrustMeAlready` 已测试，无实际效果。

这类模块本质上是：

- Hook Java 层的 `TrustManager`
- Hook `HttpsURLConnection`
- Hook OkHttp 等常见 Java 网络库

对多数原生 Android 应用有效，但对当前目标无效。结合后续分析，主要原因包括：

- 目标 App 存在 Flutter / Native 层网络校验
- 关键链路不完全经过 Java 常规网络栈

因此该方案未继续使用。

### 3. 确认 Flutter 技术栈

技术栈判断直接决定后续工具选择。

判断依据可以是：

- APK 或内存里存在 `libflutter.so`
- 界面特征更接近 `FlutterView`
- Java 层通用 SSL 绕过方案无效

确认 Flutter 后，排查方向由：

```text
Xposed / Java SSL Unpinning
```

切换为：

```text
Frida / Native Hook / 反编译关键类
```

可直接通过内存映射确认：

```bash
# 先拿到目标进程 PID
adb shell "ps -A | grep com.tencent.gamehelper.smoba"

# 再看是否加载了 flutter 相关 so
adb shell "su -c 'cat /proc/<PID>/maps | grep -i flutter'"
```

## 采用 Frida 的原因

Frida 在该场景下承担两项任务：

1. 让 Reqable 能继续看到请求
2. 直接从 App 内部拿到抓包里看不到的关键参数

第二项是后续分析的核心。

业务复现过程中，很快可以发现两类参数无法仅靠普通抓包稳定获取：

- `encodeRes`
- `userKey`

二者直接决定：

- `encodeParam` 如何生成
- `campencrypt=true` 的响应如何解密

## Frida 实战过程

### 1. SSL 绕过验证

初始阶段使用 Flutter 方向的 SSL 绕过脚本，例如：

```bash
frida -U -f com.tencent.gamehelper.smoba -l flutter_bypass.js
```

用途：

- 不去改 APK
- 直接在运行时绕过 Flutter/Native 层的证书校验

该阶段用于验证：

- App 是否确实存在 Flutter 层 Pinning
- Reqable 在 SSL 校验绕过后是否能正常看到流量

Frida 环境可先做最小验证：

```bash
frida-ps -U

# 只附加，不主动拉起
frida -U com.tencent.gamehelper.smoba
```

### 2. 广谱 Hook 的副作用

目标 App 对启动期和运行期都比较敏感，尤其涉及：

- Tinker
- RFix
- 较重的通用 SSL Hook
- `spawn` 过早注入

测试过程中出现过启动后直接闪退。

后续策略调整为：

- 能少 Hook 就少 Hook
- 优先 Hook 明确的目标类
- 优先观察关键参数落地位置
- 不做大范围网络层打印

该类应用更适合围绕关键值做小范围 Hook，而不是大面积网络层拦截。

### 3. 低干扰 Hook

后续采用的稳定方案：

- 登录成功时，观察 `encodeRes`
- `encodeRes` 解出 `userKey` 后，观察 `updateUserKey`
- 如果只想确认当前账号的密钥是否就绪，再观察 `getUserKey`

这些 Hook 点较轻，副作用可控。

例如：

- `LoginProcessSecurityParamHandler.onLoginResult`
- `NetSecurityServiceImpl.updateUserKey`
- `NetSecurityServiceImpl.getUserKey`

最终保留的脚本形态如下：

```js
setTimeout(function () {
    Java.perform(function () {
        function s(v) {
            try {
                if (v === null || v === undefined) return 'null';
                return String(v);
            } catch (e) {
                return '[toString failed]';
            }
        }

        try {
            var NetSecurityServiceImpl = Java.use('com.tencent.gamehelper.biz.account.service.NetSecurityServiceImpl');
            var updateUserKey = NetSecurityServiceImpl.updateUserKey.overload(
                'java.lang.String',
                'java.lang.String'
            );

            updateUserKey.implementation = function (userId, userKey) {
                console.log('================ [camp][updateUserKey] ================');
                console.log('[camp][updateUserKey] userId=' + s(userId));
                console.log('[camp][updateUserKey] userKey=' + s(userKey));
                return updateUserKey.call(this, userId, userKey);
            };

            console.log('[+] Hooked NetSecurityServiceImpl.updateUserKey');
        } catch (e) {
            console.log('[-] Failed to hook updateUserKey: ' + e);
        }
    });
}, 3000);
```

运行方式：

```bash
frida -U -f com.tencent.gamehelper.smoba -l android-frida-camp-security-minimal.js
```

输出形态如下：

```text
[+] Hooked NetSecurityServiceImpl.updateUserKey
================ [camp][updateUserKey] ================
[camp][updateUserKey] userId=218634301
[camp][updateUserKey] userKey=42843b6e8c64a390
```

关键点：

```text
NetSecurityServiceImpl.updateUserKey(userId, userKey)
```

该点稳定命中后，`userKey` 相关链路即可继续向下分析。

## 反编译后的关键链路

抓包解决的是流量可见性，逆向解决的是参数来源与处理逻辑。后续工作主要围绕 Frida 结果与反编译源码的对应关系展开。

### 1. `encodeRes -> userKey`

关键类：

- `LoginProcessSecurityParamHandler`

链路如下：

1. 登录响应里拿到 `encodeRes`
2. 用 RSA 公钥解密 `encodeRes`
3. 解析 JSON
4. 取出 `userKey`
5. 调用 `updateUserKey(userId, userKey)` 保存

反编译后的关键代码摘录：

```java
String str = result.encodeRes;
((NetSecurityService) ComponentService.get(NetSecurityService.class)).updateServerTimeDiff(Long.valueOf(result.svrTime));
if (TextUtils.isEmpty(str)) {
    CLog.e(TAG, "encodeRes is empty, return directly");
    return;
}
try {
    PublicKey publicKeyGeneratePublic = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.decode(((NetSecurityService) ComponentService.get(NetSecurityService.class)).getPublicKey(), 2)));
    byte[] bArrDecryptWithPublicKey = RSAEncrypt.decryptWithPublicKey(publicKeyGeneratePublic, Base64.decode(str, 2));
    JSONObject jSONObject = new JSONObject(new String(bArrDecryptWithPublicKey, UTF_8));
    NetSecurityService netSecurityService = (NetSecurityService) ComponentService.get(NetSecurityService.class);
    String str2 = result.userId;
    String strOptString = jSONObject.optString("userKey");
    netSecurityService.updateUserKey(str2, strOptString);
    SpFactory.INSTANCE.getSafeSp(SP_LOGIN_SECURITY_KEY).edit().putString(SP_LOGIN_SECURITY_USER_KEY + result.userId, jSONObject.optString("userKey")).apply();
} catch (Throwable th) {
    CLog.e(TAG, "parse encode res failed", th);
}
```

结论：

```text
encodeRes 不是最终密钥
userKey 才是后续业务请求真正使用的对称密钥
```

### 2. `encodeParam` 的生成

关键类：

- `BaseParamUtils`

链路如下：

1. 构造 JSON：

```json
{
  "timestamp": 1234567890,
  "nonce": "userId:uuidNoDash:timestamp"
}
```

2. 用 `userKey` 做 XXTEA 加密
3. 再做 Base64
4. 作为请求头里的 `encodeParam`

反编译后的关键代码摘录：

```java
long serverTimeDiff = ((NetSecurityService) ComponentService.get(NetSecurityService.class)).getServerTimeDiff();
long jCurrentTimeMillis = serverTimeDiff == 0 ? System.currentTimeMillis() : serverTimeDiff + SystemClock.elapsedRealtime();
String str = AccountManager.instance.delegateGetCurrentAccount().userId;
String string = UUID.randomUUID().toString();
String strE = l.E(string, Constants.ACCEPT_TIME_SEPARATOR_SERVER, "", false, 4, null);
JSONObject jSONObject = new JSONObject();
jSONObject.put("timestamp", jCurrentTimeMillis);
jSONObject.put(com.tencent.connect.common.Constants.NONCE, str + ':' + strE + ':' + jCurrentTimeMillis);
String userKey = ((NetSecurityService) ComponentService.get(NetSecurityService.class)).getUserKey(str);
String string3 = jSONObject.toString();
byte[] bytes3 = string3.getBytes(charset);
if (userKey != null) {
    bytes = userKey.getBytes(charset);
} else {
    bytes = null;
}
String strEncodeToString2 = Base64.encodeToString(XXTEA.encrypt(bytes3, bytes), 2);
CLog.d(TAG, "symmetric encryption params: " + jSONObject + ", userKey: " + userKey + ", encodedParam: " + strEncodeToString2);
return strEncodeToString2;
```

结论：

- 没有 `userKey`
- 就无法正确生成 `encodeParam`

### 3. 响应解密

关键类：

- `ResponseDecryptNewInterceptor`

链路如下：

- 如果响应头里 `campencrypt=true`
- 响应体其实不是明文 JSON
- 需要 Base64 解码后，再用同一个 `userKey` 做 XXTEA 解密

反编译后的关键代码摘录：

```java
Response responseProceed = chain.proceed(chain.request());
if (responseProceed.isSuccessful() && Intrinsics.d("true", responseProceed.headers().get("campencrypt"))) {
    HashMap<String, Object> map = new HashMap<>();
    try {
        ResponseBody responseBodyBody = responseProceed.body();
        if (responseBodyBody != null) {
            Response responseBuild = responseProceed.newBuilder().body(ResponseBody.INSTANCE.create(responseBodyBody.contentType(), decrypt(responseBodyBody.bytes(), map))).build();
            map.put("status", 0);
            return responseBuild;
        } else {
            map.put("status", 4);
        }
    } finally {
        ((ReportService) ComponentService.get(ReportService.class)).reportDtEvent(EVENT_ID_DECRYPT_STATISTIC, map);
    }
}
return responseProceed;
```

很多“请求成功但解析失败”的情况，本质上是返回体仍处于密文状态。

同类中的解密逻辑：

```java
userKey = ((NetSecurityService) ComponentService.get(NetSecurityService.class)).getUserKey(AccountManager.instance.delegateGetCurrentAccount().userId);
if (TextUtils.isEmpty(userKey)) {
    params.put("status", 2);
    CLog.e(TAG, "userKey is empty, request will fail");
    return byteArray;
}
byte[] bArrDecode = Base64.decode(byteArray, 0);
if (userKey != null) {
    bytes = userKey.getBytes(Charsets.UTF_8);
} else {
    bytes = null;
}
byte[] result = XXTEA.decrypt(bArrDecode, bytes);
return result;
```

### 4. 无 `userKey` 时的另一条链路

关键类：

- `LoginBaseParamUtils`

该类对应登录期或尚未具备 `userKey` 的场景，走的是 RSA 参数加密，而不是业务期的 XXTEA `encodeParam`。

反编译后的关键代码摘录：

```java
long jCurrentTimeMillis = System.currentTimeMillis();
String string = UUID.randomUUID().toString();
String strE = l.E(string, Constants.ACCEPT_TIME_SEPARATOR_SERVER, "", false, 4, null);
JSONObject jSONObject = new JSONObject();
jSONObject.put("timestamp", jCurrentTimeMillis);
jSONObject.put(com.tencent.connect.common.Constants.NONCE, ':' + strE + ':' + jCurrentTimeMillis);
LoginBaseParam loginBaseParam = new LoginBaseParam();
jSONObject.put("cDeviceId", loginBaseParam.getKey1());
jSONObject.put("deviceid", loginBaseParam.getKey2());
// ... 中间省略若干设备字段
PublicKey publicKeyGeneratePublic = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(Base64.decode(((NetSecurityService) ComponentService.get(NetSecurityService.class)).getPublicKey(), 0)));
String string2 = jSONObject.toString();
byte[] bytes = string2.getBytes(Charsets.UTF_8);
String strEncodeToString = Base64.encodeToString(RSAEncrypt.encryptWithPublicKey(publicKeyGeneratePublic, bytes), 2);
CLog.d(TAG, "asymmetric encode param: " + jSONObject + "， encodedParams: " + strEncodeToString);
return strEncodeToString;
```

对后续业务接口复现而言，重点仍然是拿到 `userKey`。

### 5. `userKey` 的读取与落地

关键类：

- `NetSecurityServiceImpl`

该类负责 `userKey` 的内存落地与持久化读取；后续 `encodeParam` 生成与响应解密都依赖这里的取值。

反编译后的关键代码摘录：

```java
private static final ConcurrentHashMap<String, String> userKeyMap = new ConcurrentHashMap<>();

@Override
public void updateUserKey(String userId, String userKey) {
    Intrinsics.i(userId, "userId");
    Intrinsics.i(userKey, "userKey");
    userKeyMap.put(userId, userKey);
}

@Override
public String getUserKey(String userId) {
    if (userId == null) {
        return null;
    }
    ConcurrentHashMap<String, String> concurrentHashMap = userKeyMap;
    if (TextUtils.isEmpty(concurrentHashMap.get(userId))) {
        CLog.w(TAG, "get uerKey from sp");
        return SpFactory.INSTANCE.getSafeSp(LoginProcessSecurityParamHandler.SP_LOGIN_SECURITY_KEY).getString(LoginProcessSecurityParamHandler.SP_LOGIN_SECURITY_USER_KEY + userId, null);
    }
    return concurrentHashMap.get(userId);
}
```

## 逆向结果

结合 Frida 与反编译，可确定以下结论：

### 1. `encodeRes` 可以解出 `userKey`

源码链路明确成立。

### 2. 后续业务请求主要依赖 `userKey`

它同时负责：

- 生成 `encodeParam`
- 解密加密响应

### 3. 部分抓包参数可自动生成

例如：

- `encodeParam`
- `x-log-uid`
- `traceparent`
- `crand`

### 4. 动态必需参数少于表面观察结果

对已测试接口，最小核心集接近：

- `token`
- `userId`
- `userKey` 或 `encodeRes`

部分附属头虽然会出现在请求中，但并不属于强校验项。

## 工作流

后续处理同类应用时，可按以下顺序执行：

### 第一步：先确认不是系统证书问题

- Root
- Magisk
- Reqable 证书模块
- 普通网页是否能抓

普通网页无法抓包时，不进入 Frida 阶段。

### 第二步：判断是不是 Flutter

确认 Flutter 后，不再以 `TrustMeAlready` 为主线继续投入时间。

### 第三步：Frida 先做低成本验证

目标：

- SSL 是否能绕过
- App 是否会因为过重 Hook 闪退

命令顺序：

```bash
# 1. 先确认 frida-server 正常
frida-ps -U

# 2. 再用最小脚本测试
frida -U -f com.tencent.gamehelper.smoba -l android-frida-camp-security-minimal.js
```

### 第四步：只 Hook 关键参数点

优先找：

- 登录结果处理类
- `userKey` 落地类
- 安全参数生成类
- 响应解密拦截器

### 第五步：反编译对照

需要逐项确认：

- `encodeRes` 从哪来
- `userKey` 怎么落地
- `encodeParam` 怎么生成
- 哪些响应是密文
- 哪些头是真正强校验

辅助命令：

```bash
# jadx 反编译后，在源码目录里全局搜关键字段
rg -n "encodeRes|userKey|encodeParam|campencrypt|updateUserKey" /path/to/jadx-output

# 搜索可能的安全参数生成类
rg -n "timestamp|nonce|XXTEA|RSAEncrypt" /path/to/jadx-output
```

## 未采用的方案

未继续使用的方案如下：

### 1. TrustMeAlready

已测试，对当前目标未解决问题。主要原因是 Flutter / Native 层链路不受其控制。

### 2. reFlutter

未采用。原因是当前场景更适合使用 Frida 做动态验证，同时避免引入重打包、重签名与完整性校验风险。

### 3. r0capture

未采用。当前目标不是通用离线明文提取，而是安全参数链路的定位与还原，因此 Frida + 反编译更合适。

## 总结

核心路径如下：

```text
Reqable 抓流量
  -> 确认 TrustMeAlready 无效
  -> 判断目标是 Flutter
  -> Frida 做低干扰 SSL 绕过
  -> Hook 登录和安全参数落地点
  -> 反编译确认 encodeRes / userKey / encodeParam / 响应解密
  -> 最终复现业务请求
```

仅停留在 HTTPS 明文可见，通常不足以完成腾讯系应用的业务复现。进一步还原安全参数生成、密钥落地与响应解密链路，才具备稳定复现条件。
