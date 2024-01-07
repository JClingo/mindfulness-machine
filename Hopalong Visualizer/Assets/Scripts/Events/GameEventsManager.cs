using System;
using UnityEngine;

public class GameEventsManager : MonoBehaviour
{

    public static GameEventsManager instance { get; private set; }

    public void Awake()
    {
        if (instance != null)
        {
            Debug.LogError("More than one Game Events Manager in the scene!");
        }
        instance = this;
    }

    // for each event we're tracking
    // TODO: build these out
    public event Action onSomeEvent;
    public void SomeEvent()
    {
        if (onSomeEvent != null)
        {
            onSomeEvent();
        }
    }
}
