using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class ExperimentData
{
    public long lastUpdated;

    // TODO: Load from config?
    public string condition;
    public long timeCompleted;
    public long timeStarted;
    public NavigatorData navigatorData = null;
    public ControlData controlData = null;
    public List<ForagingData> foragingData;





    public ExperimentData()
    {
        foragingData = new List<ForagingData>();
    }




}
