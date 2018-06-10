using System;
using UnityEngine;
using System.Collections;
using System.Text.RegularExpressions;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Linq;

public class Done_GameController : MonoBehaviour
{
	public GameObject[] hazards;
	public Vector3 spawnValues;
	public int hazardCount;
	public float spawnWait;
	public float startWait;
	public float waveWait;

	public Text scoreText;
	public Text gameOverText;

	public static string addScoreURL = "http://localhost:8081/add-score?"; 

	private bool gameOver;
	private int score;
	private static int lowScore;
	public GameObject restartButton;
	public GameObject quitButton;

	void Start ()
	{
		gameOver = false;
		gameOverText.text = "";
		restartButton.SetActive(false);
		quitButton.SetActive(false);

		score = 0;
		UpdateScore ();
		StartCoroutine (SpawnWaves ());
	}
		
	IEnumerator SpawnWaves ()
	{
		yield return new WaitForSeconds (3);
		while (true)
		{
			for (int i = 0; i < hazardCount; i++)
			{
				GameObject hazard = hazards [UnityEngine.Random.Range (0, hazards.Length)];
				Vector3 spawnPosition = new Vector3 (UnityEngine.Random.Range (-spawnValues.x, spawnValues.x), spawnValues.y, spawnValues.z);
				Quaternion spawnRotation = Quaternion.identity;
				Instantiate (hazard, spawnPosition, spawnRotation);
				yield return new WaitForSeconds (spawnWait);
			}
			yield return new WaitForSeconds (waveWait);

			if (gameOver)
			{
				restartButton.SetActive(true);
				quitButton.SetActive(true);
				break;
			}
		}
	}

	public void AddScore (int newScoreValue)
	{
		score += newScoreValue;
		UpdateScore ();
	}

	void UpdateScore ()
	{
		scoreText.text = "Score: " + score;
	}

	IEnumerator wait(int period){
		yield return new WaitForSeconds (period);
	}

	public void GameOver ()
	{
		gameOverText.text = "Game Over!";
		gameOver = true;
		StartCoroutine (addScore ());
	}
	IEnumerator addScore(){
		WWWForm hs_post = new WWWForm();
		hs_post.AddField ("username", PlayerPrefs.GetString("username"));

		hs_post.AddField ("score", Convert.ToInt32(score));
		WWW postRequest = new WWW (addScoreURL, hs_post);
		yield return hs_post;
		StartCoroutine (WaitForRequest (postRequest));
	}
	IEnumerator WaitForRequest(WWW www){
		yield return www;
	}
	public void QuitGame(){
		SceneManager.LoadScene("account");
	}
	public void RestartGame(){
		SceneManager.LoadScene("Done_Main");
	}
}