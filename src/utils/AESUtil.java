package cn.sunhj.common.utils;

import cn.sunhj.common.constants.NumberConstant;
import org.apache.commons.codec.binary.Base64;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.Security;

/**
 * AES加密工具类
 *
 * @author ZFB
 *
 */
public class AESUtil {
	// 算法名称
	private static final String KEY_ALGORITHM = "AES";
	// 加解密算法/模式/填充方式
	private static final String ALGORITHM_MODE_PADDING = "AES/CBC/PKCS7Padding";

//		private static Cipher cipher;

	static {
		Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
	}


	static class CliperInstance {
		private static ThreadLocal<Cipher> cipherTL = new ThreadLocal<Cipher>() {
			@Override
			protected Cipher initialValue() {
				try {
					return Cipher.getInstance(ALGORITHM_MODE_PADDING);
				} catch (Exception e) {
					return null;
				}
			}
		};

		public static Cipher getInstance() throws NoSuchAlgorithmException,
				NoSuchPaddingException {
			return cipherTL.get();
		}
	}




	/**
	 * 加密
	 *
	 * @author ZFB
	 * @param value
	 * 	      待加密的字符串
	 * @param key
	 *    appid对应的密钥secret
	 * @return 加密后的字符串
	 */
	public static String encrypt(String value, String key) {
		try {
			Cipher cipher = CliperInstance.getInstance();//创建密码器
			SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"),
					KEY_ALGORITHM);
			String initVector = key.substring(NumberConstant.ZERO_I,
					NumberConstant.SIXTEEN_I);
			IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
			cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
			byte[] encrypted = cipher.doFinal(value.getBytes());
			return Base64.encodeBase64String(encrypted);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return "UNKONWN";
	}

	/**
	 * 解密方法
	 *
	 * @author ZFB
	 * @param encrypted
	 *    加密后的字符串
	 * @param key
	 *    appid对应的密钥secret
	 * @return 解密后的字符串
	 */
	public static String decrypt(String encrypted, String key) {
		try {
			Cipher cipher = CliperInstance.getInstance();//创建密码器
			SecretKeySpec skeySpec = new SecretKeySpec(key.getBytes("UTF-8"),
					KEY_ALGORITHM);
			String initVector = key.substring(NumberConstant.ZERO_I,
					NumberConstant.SIXTEEN_I);
			IvParameterSpec iv = new IvParameterSpec(initVector.getBytes("UTF-8"));
			cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
			byte[] original = cipher.doFinal(Base64.decodeBase64(encrypted));
			return new String(original);
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return "UNKONWN";
	}


}
