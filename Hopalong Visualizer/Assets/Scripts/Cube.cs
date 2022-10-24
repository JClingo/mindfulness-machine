using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Cube : MonoBehaviour
{

    private Renderer rend;
    // Start is called before the first frame update
    void Start()
    {
        rend = GetComponent<Renderer>();
        StartCoroutine(ColorChange());
    }

    // Update is called once per frame
    void Update()
    {
       
    }

    public void ChangeColor()
    {
        rend.material.SetColor("_Color", Random.ColorHSV(0f, 1f, 1f, 1f, 0.75f, 1f, 0.5f, 0.5f));
    }

    public IEnumerator ColorChange()
    {
        for (; ; )
        {
            ChangeColor();
            yield return new WaitForSeconds(2);
        }

    }
}
