using System;
using UnityEngine;
using System.Collections;
using System.Linq;
using LitJson;

public class HSController : MonoBehaviour
{
	public GUIText highscores;
	public static string addScoreURL = "http://localhost//add-score?"; 
	public static string highscoreURL = "http://localhost/get-scores";
	public ArrayList entry;

	//void Start()
	//{
	//	StartCoroutine(HighScores("Zack is a badass!!!!"));
		//StartCoroutine(GetScores());
	//}
	public void PrintScores()
	{
		StartCoroutine (HighScores ("Zack is a badass!!!!"));
	}


	IEnumerator PostScores(string name, int score)
	{
		//This connects to a server side script that will add the name and score to a MySQL DB.
		string post_url = addScoreURL + "name=" + WWW.EscapeURL(name) + "&score=" + score;

		// Post the URL to the site and create a download object to get the result.
		WWW hs_post = new WWW(post_url);
		yield return hs_post; // Wait until the download is done

		if (hs_post.error != null)
		{
			print("There was an error posting the high score: " + hs_post.error);
		}
	}
	IEnumerator HighScores (string message)
	{
		highscores.text = message;
		highscores.enabled = true;
		yield return new WaitForSeconds (3);
		highscores.enabled = false;
		//Debug.Log ("I'm in HighScores()");
		//Debug.Log ("message: " + message);

	}
	IEnumerator GetScores()
	{
		//gameObject.guiText.text = "Loading Scores";
		WWW hs_get = new WWW (highscoreURL);
		yield return hs_get;

		if (hs_get.error != null) {
			print ("There was an error getting the high sore: " + hs_get.error);
		} else {
			print (hs_get.text);
		}
	}

}