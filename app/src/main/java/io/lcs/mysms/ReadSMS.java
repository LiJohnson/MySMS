package io.lcs.mysms;

import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;

import com.google.gson.Gson;
import com.squareup.okhttp.MediaType;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.RequestBody;

import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by lcs on 15-5-31.
 */
public class ReadSMS {
	public static final String CONTENT_URI_SMS = "content://sms";
	public static final String CONTENT_URI_SMS_INBOX = "content://sms/inbox";
	public static final String CONTENT_URI_SMS_SENT = "content://sms/sent";
	public static final String CONTENT_URI_SMS_CONVERSATIONS = "content://sms/conversations";
	public static String[] SMS_COLUMNS = new String[]{
			"_id", //0
			"thread_id", //1
			"address", //2
			"person", //3
			"date", //4
			"body", //5
			"read", //6; 0:not read 1:read; default is 0
			"type", //7;  0:all 1:inBox 2:sent 3:draft 4:outBox  5:failed 6:queued
			"service_center" //8
	};


	private Context mContext;

	public ReadSMS(Context context) {
		this.mContext = context;
	}

	public String read() {
		Cursor cursor = mContext.getContentResolver().query(Uri.parse(CONTENT_URI_SMS), SMS_COLUMNS, null, null, "date desc");
		Map<String ,String> map;
		List<Map<String, String>> list = new ArrayList<>();
		for (int i = 0, len = cursor.getCount(); i < len; i++) {
			cursor.moveToPosition(i);
			map = new HashMap<>();
			for (int index = 0; index < SMS_COLUMNS.length; index++) {
				map.put(SMS_COLUMNS[index], cursor.getString(index));
			}
			list.add(map);
		}
		return new Gson().toJson(list);
	}

	public String export()  {
		File SDPATH = Environment.getExternalStorageDirectory();
		File sms = new File(SDPATH, "mySMS.json");
		try {
			FileWriter fw = new FileWriter(sms);
			fw.write(this.read());
			fw.flush();
			fw.close();
		} catch (Exception e) {
			e.printStackTrace();
			return "[export fail !]";
		}
		return sms.getAbsolutePath();
	}

	public String upload(String url , final Handler handler) throws Exception {
		if (url == null || "".equals(url.trim())) {
			throw new Exception("no url");
		}
		MediaType JSON = MediaType.parse("application/json; charset=utf-8");
		Map<String, String> map = new HashMap<>();
		map.put("data", this.read());
		final OkHttpClient client = new OkHttpClient();
		RequestBody body = RequestBody.create(JSON, new Gson().toJson(map));
		final Request request = new Request.Builder()
				.url(url)
				.post(body)
				.build();

		new Thread(new Runnable() {
			@Override
			public void run() {
				String result ;
				try {
					result = client.newCall(request).execute().body().string();
				} catch (Exception e) {
					e.printStackTrace();
					result = e.getMessage();
				}
				Message msg = new Message();
				Bundle b = new Bundle();
				b.putString("result", result);
				msg.setData(b);
				handler.sendMessage(msg);
			}
		}).start();
		return "upload ..... ";
	}

}
