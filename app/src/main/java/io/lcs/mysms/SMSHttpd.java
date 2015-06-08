package io.lcs.mysms;

import fi.iki.elonen.NanoHTTPD;

/**
 * Created by lcs on 15-6-8.
 */

public class SMSHttpd extends NanoHTTPD {
	public SMSHttpd(int port) {
		super(port);
	}
}