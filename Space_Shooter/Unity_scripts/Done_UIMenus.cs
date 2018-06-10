using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Text.RegularExpressions;
using System.Linq;
using System;
//using System.Windows.Forms.MessageBox;
//using System.Windows.Forms;


public class Done_UIMenus : MonoBehaviour {
	public GameObject OKButtonLogin;
	public GameObject XButtonLogin;
	public GameObject MessageContainer;
	public GameObject ErrorText;

	public static string login = "http://localhost:8081/login?"; 
	public static string signup = "http://localhost:8081/signup?";
	public static string logout = "http://localhost:8081/logout";

	public GameObject temp;

	// Use this for initialization
	void Start () {
		OKButtonLogin.SetActive(false);
		XButtonLogin.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
	}
	public void MessageButton(){
		OKButtonLogin.SetActive(false);
		XButtonLogin.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ButtonClick ("login");
	}

	public void ButtonClick (string scene) {
		SceneManager.LoadScene(scene);
	}
	public void signupbutton(){
		StartCoroutine(PostAccount ());
	}	
	public void loginbutton(){
		StartCoroutine(PostLogin ());
	}	

	IEnumerator PostAccount()
	{
		WWWForm hs_post = new WWWForm();

		hs_post.AddField ("username", PlayerPrefs.GetString("username"));
		hs_post.AddField ("email", PlayerPrefs.GetString("email"));
		hs_post.AddField ("phone", PlayerPrefs.GetString("phone"));
		hs_post.AddField ("password", PlayerPrefs.GetString("pass1"));
		//print (PlayerPrefs.GetString ("pass1"));

		WWW postRequest = new WWW (signup, hs_post);
		StartCoroutine(WaitForRegister(postRequest));

		yield return hs_post;
		//ButtonClick ("register");
	}
	IEnumerator WaitForRegister(WWW www){
		yield return www;
		ButtonClick ("login");
	}
	IEnumerator PostLogin()
	{
		WWWForm hs_post = new WWWForm();

		hs_post.AddField ("email", PlayerPrefs.GetString("email"));
		hs_post.AddField ("password", PlayerPrefs.GetString("pass1"));

		WWW postRequest = new WWW (login, hs_post);
		StartCoroutine(WaitForRequest(postRequest));

		yield return hs_post;
	}
	IEnumerator WaitForRequest(WWW www){
		yield return www;

		//print (www.text);

		if (www.text.Contains ("true")) {
			PlayerPrefs.Save ();
			ButtonClick ("account");
		} else {
			//ButtonClick ("login");
			OKButtonLogin.SetActive (true);
			XButtonLogin.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText.SetActive (true);
		}
	}
}
