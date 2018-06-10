using System;
using System.Linq;
using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class Edit_Phone : MonoBehaviour {
	public GameObject OKButtonPhone;
	public GameObject XButtonPhone;
	public GameObject MessageContainer;
	public GameObject ErrorText;
	public GameObject ErrorText2;

	public static string update = "http://localhost:8081/update-info?";

	// Use this for initialization
	void Start () {
		OKButtonPhone.SetActive(false);
		XButtonPhone.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ErrorText2.SetActive (false);
	}
	public void ButtonClick (string scene) {
		SceneManager.LoadScene(scene);
	}
	public void MessageButton(){
		OKButtonPhone.SetActive(false);
		XButtonPhone.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ErrorText2.SetActive (false);
		ButtonClick ("Edit_Phone");
	}
	public void UpdatePhoneButton(){
		StartCoroutine (UpdatePhone ());
	}
	IEnumerator UpdatePhone()
	{
		string phone = PlayerPrefs.GetString ("phone");
		//print (phone.All (c => c >= '0' && c <= '9'));
		if (phone.Length != 10) {   
			OKButtonPhone.SetActive (true);
			XButtonPhone.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText.SetActive (true);
		} else if (!phone.All (c => c >= '0' && c <= '9')) {
			OKButtonPhone.SetActive (true);
			XButtonPhone.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText2.SetActive (true);
		} else {
			WWWForm hs_post = new WWWForm ();

			hs_post.AddField ("email", PlayerPrefs.GetString ("email"));
			hs_post.AddField ("input", phone);
			hs_post.AddField ("datatype", "phone");

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
