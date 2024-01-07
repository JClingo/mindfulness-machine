using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class ForagingData
{
    public List<NavigatorTimestepData> timesteps;
    public long timeStarted;
    public long timeTrainingCompleted; // used for determining when they actually started the main task
    public long timeCompleted;

    public ForagingData()
    {
       // timesteps = new List<ForagingTimestepData>();
    }
}

[System.Serializable]
public class ForagingTimestepData
{
    public float time;
    public int seed;
    public int speed;
    public int rotationSpeed;
    public Vector2 cameraPosition; // 0,0 is the middle of the screen and 1,1 is the normalized limit to how far they can shift in either direction
    public Vector3 headPosition;
    public Vector2 eyePosition; // do we need a separate one for either eye? -- TODO: the shape of this will likely be a bit different

    public ForagingTimestepData(float time, Vector2 cameraPosition, Vector3 headPosition, Vector2 eyePosition)
    {
        this.time = time;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.cameraPosition = cameraPosition;
        this.headPosition = headPosition;
        this.eyePosition = eyePosition;
    }


}