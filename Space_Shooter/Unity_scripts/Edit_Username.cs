using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System;

public class Edit_Username : MonoBehaviour {
	public GameObject OKButtonUsername;
	public GameObject XButtonUsername;
	public GameObject MessageContainer;
	public GameObject ErrorText;

	public static string update = "http://localhost:8081/update-info?";

	// Use this for initialization
	void Start () {
		OKButtonUsername.SetActive(false);
		XButtonUsername.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
	}
	public void ButtonClick (string scene) {
		SceneManager.LoadScene(scene);
	}
	public void MessageButton(){
		OKButtonUsername.SetActive(false);
		XButtonUsername.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ButtonClick ("Edit_Username");
	}
	public void UpdateUserNameButton(){
		StartCoroutine (UpdateUserName ());
	}
	IEnumerator UpdateUserName()
	{
		string uname = PlayerPrefs.GetString ("username");
		if (uname.Length < 6) {
			OKButtonUsername.SetActive (true);
			XButtonUsername.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText.SetActive (true);
			yield return null;
		} else {
			WWWForm hs_post = new WWWForm();

			hs_post.AddField ("email", PlayerPrefs.GetString("email"));
			hs_post.AddField ("input", uname);
			hs_post.AddField ("datatype", "username");

			WWW postRequest = new WWW (update, hs_post);
			yield return hs_post;
			StartCoroutine (WaitForRequest (postRequest));
		}
	}
	IEnumerator WaitForRequest(WWW www){
		yield return www;
		ButtonClick ("account");
	}
}
