using System;
using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Text.RegularExpressions;
using System.Linq;

public class Account : MonoBehaviour {
	public static string getAccount = "http://localhost:8081/get-account?"; 
	public static string removeUser = "http://localhost:8081/remove-user?";
	public static string logout = "http://localhost:8081/logout";
	public static string editPassword = "http://localhost:8081/update-password?";
	public static string update = "http://localhost:8081/update-info?";
	public static string check = "http://localhost:8081/check-for-scores?";

	public Text username;
	public Text email;
	public Text phone; 
	public Text password;
	public Text userscores;
	// Use this for initialization
	void Start () {
		StartCoroutine (GetAccount ());
	}
	public void LoadAccount(){
		StartCoroutine (GetAccount ());
	}
	public void ButtonClick (string scene) {
		PlayerPrefs.Save ();
		SceneManager.LoadScene(scene);
	}
	public void DeleteButton(){
		StartCoroutine (RemoveUser ());
	}
	public void DeletePhoneButton(){
		StartCoroutine (DeletePhone ());
	}
	IEnumerator DeletePhone()
	{
		WWWForm hs_post = new WWWForm();
		hs_post.AddField ("email", PlayerPrefs.GetString("email"));
		hs_post.AddField ("input", "<No Record>");
		hs_post.AddField ("datatype", "phone");

		WWW postRequest = new WWW (update, hs_post);
		StartCoroutine(WaitForRequest(postRequest));

		yield return hs_post;
	}
	IEnumerator WaitForRequest(WWW www){
		yield return www;
		ButtonClick ("account");
	}
	public void logoutbutton(){
		StartCoroutine(LogoutAccount ());
	}	
	IEnumerator LogoutAccount(){
		WWW getRequest = new WWW (logout);
		yield return getRequest;

		ButtonClick ("login");
	}	

	private string getVal(string str, string target ){
		string lookFor = "\"" + target + "\":{\"S\":\"";
		string result;

		int ipos = str.IndexOf(lookFor);
		int jpos = str.IndexOf("\"}", ipos);
		//print (jpos);

		result = str.Substring(ipos, jpos-ipos);
		ipos = result.LastIndexOf ("\"");
		result = result.Substring (ipos+1, result.Length - (ipos+1));

		return result;
	}
	private string getScores(string str){
		string result = "";
		int ipos;
		int jpos;
		print (str);
		int end;
		if (str.IndexOf ("scores\":{\"L\":[{\"0\":\"undefined") == -1) {
			for (int i = 0; i < 10; i++) {

				ipos = str.IndexOf (i.ToString () + "\":\"");
				jpos = str.IndexOf ("\"}", ipos);
				end = str.IndexOf ("]");

				if (i < 9)
					result += (i + 1).ToString () + "\t\t\t\t\t\t\t" + str.Substring (ipos + 4, jpos - (ipos + 4)) + "\n";
				else
					result += (i + 1).ToString () + "\t\t\t\t\t\t" + str.Substring (ipos + 4, jpos - (ipos + 4)) + "\n";
				if ((end - jpos) == 2) {
					break;
				}
				str = str.Substring (jpos + 5, str.Length - (jpos + 5));
			}
		} else {
			result = "<No High Scores>";
		}
		return result;
	}

	IEnumerator GetAccount(){
		string url = getAccount + "email=" + PlayerPrefs.GetString ("email");
		WWW hs_get = new WWW (url);
		yield return hs_get;

		print (hs_get.text);
		username.text = getVal(hs_get.text, "username");
		email.text = getVal(hs_get.text, "email");
		phone.text = getVal(hs_get.text, "phone");
		PlayerPrefs.SetString ("username",username.text);
		PlayerPrefs.SetString ("email",email.text);
		PlayerPrefs.SetString ("phone",phone.text);
		userscores.text = getScores (hs_get.text);
		print("phone: " + PlayerPrefs.GetString ("phone"));
	}
	IEnumerator WaitForAccount(WWW www){
		username.text = getVal(www.text, "username");
		email.text = getVal(www.text, "email");
		phone.text = getVal(www.text, "phone");
		userscores.text = getScores (www.text);
		print (username.text);
		print (email.text);
		yield return www;
	}
	IEnumerator RemoveUser(){
		string email = PlayerPrefs.GetString ("email");
		string url = removeUser + "email=" + email;

		StartCoroutine (LogoutAccount ());

		WWW hs_get = new WWW(url);
		yield return hs_get;
	}
}
