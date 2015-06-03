package io.lcs.mysms;

import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;


public class MainActivity extends ActionBarActivity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		init();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		//getMenuInflater().inflate(R.menu.menu_main, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		// Handle action bar item clicks here. The action bar will
		// automatically handle clicks on the Home/Up button, so long
		// as you specify a parent activity in AndroidManifest.xml.
		int id = item.getItemId();

		//noinspection SimplifiableIfStatement
		if (id == R.id.action_settings) {
			return true;
		}else if( id == R.id.action_export) {
			new ReadSMS(this).export();
		}

		return super.onOptionsItemSelected(item);
	}

	private void init() {
		final EditText url = (EditText) findViewById(R.id.upload_url);
		final TextView tip = (TextView) findViewById(R.id.tip);
		final Button export = (Button) findViewById(R.id.btn_export);
		final Button upload = (Button) findViewById(R.id.btn_upload);
		final ReadSMS readSMS = new ReadSMS(this);

		export.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				upload.setEnabled(false);
				export.setEnabled(false);
				tip.postDelayed(new Runnable() {
					@Override
					public void run() {
						tip.setText(readSMS.export());
						upload.setEnabled(true);
						export.setEnabled(true);
					}
				}, 100);
				tip.setText("exporting ... ");
			}
		});

		upload.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				upload.setEnabled(false);
				export.setEnabled(false);
				tip.postDelayed(new Runnable() {
					@Override
					public void run() {
						String msg = readSMS.upload(url.getText().toString(), new Handler() {
							@Override
							public void handleMessage(Message msg) {
								super.handleMessage(msg);
								tip.setText(msg.getData().getString("result"));
								upload.setEnabled(true);
								export.setEnabled(true);
							}
						});
						tip.setText(msg);
					}
				}, 100);
				tip.setText("uploading ... ");
			}
		});
	}
}
