using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface IDataPersistence
{
    void LoadData(ExperimentData data);
    void SaveData(ExperimentData data);
}
