using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class Edit_Password : MonoBehaviour {
	public GameObject OKButtonPassword;
	public GameObject XButtonPassword;
	public GameObject MessageContainer;
	public GameObject ErrorText;
	public GameObject ErrorText2;

	public static string editPassword = "http://localhost:8081/update-password?";


	// Use this for initialization
	void Start () {
		OKButtonPassword.SetActive(false);
		XButtonPassword.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ErrorText2.SetActive (false);
	}
	public void ButtonClick (string scene) {
		SceneManager.LoadScene(scene);
	}
	public void MessageButton(){
		OKButtonPassword.SetActive(false);
		XButtonPassword.SetActive(false);
		MessageContainer.SetActive (false);
		ErrorText.SetActive (false);
		ErrorText2.SetActive (false);
		ButtonClick ("Edit_Password");
	}
	public void UpdatePasswordButton(){
		StartCoroutine (UpdatePassword ());
	}
	IEnumerator UpdatePassword()
	{
		string password1 = PlayerPrefs.GetString ("pass1");
		string password2 = PlayerPrefs.GetString ("pass2");
		print (PlayerPrefs.GetString ("pass1"));
		print (password1);
		print (password1.Length);


		if (password1 != password2) {
			OKButtonPassword.SetActive (true);
			XButtonPassword.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText.SetActive (true);
			yield return null;
		} else if (password1.Length < 6) {
			print (password1.Length);
			OKButtonPassword.SetActive (true);
			XButtonPassword.SetActive (true);
			MessageContainer.SetActive (true);
			ErrorText2.SetActive (true);
		}else {
			print (password1.Length);
			WWWForm hs_post = new WWWForm ();

			hs_post.AddField ("email", PlayerPrefs.GetString ("email"));
			hs_post.AddField ("password", password1);

			WWW postRequest = new WWW (editPassword, hs_post);
			//StartCoroutine (WaitForRequest (postRequest));

			yield return hs_post;
			ButtonClick ("account");
		}
	}
	//IEnumerator WaitForRequest(WWW www){
	//	yield return www;
	//	ButtonClick ("account");
	//}

}
