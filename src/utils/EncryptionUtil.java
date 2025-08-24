package cn.sunhj.common.utils;

public class EncryptionUtil {

	/**
	 * @param object data参数
	 * @param method 第三方接口方法名
	 * @return
	 * @Description 生成签名
	 * @author Lelouch
	 * @Date 2019年1月10日
	 */
	public static String encryptSign(String appId, String secret, String timestamp, String random, String data,
			String method,String version,String format) {
		StringBuffer str = new StringBuffer();
		str.append("appid=").append(appId).append("&data=").append(data).append("&format=").append(format)
				.append("&method=").append(method).append("&nonce=").append(random).append("&timestamp=")
				.append(timestamp).append("&version=").append(version);
		String sign = str.append("&appsecret=").append(secret).toString().toLowerCase();
		sign = SHA256Util.getSHA256(sign);
		return sign;
	}
}


