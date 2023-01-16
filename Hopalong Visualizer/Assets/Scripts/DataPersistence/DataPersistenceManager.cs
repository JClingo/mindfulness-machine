using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.SceneManagement;

public class DataPersistenceManager : MonoBehaviour
{

    [Header("Debugging")]
    [SerializeField] private bool disableDataPersistence = false;
    [SerializeField] private bool initializeDataIfNull = false;
    [SerializeField] private bool overrideSelectedProfileId = false;
    [SerializeField] private string testSelectedProfileId = "test";

    [Header("File Storage Config")]
    [SerializeField] private string fileName;

    [Header("Auto-save Config")]
    [SerializeField] private float autoSaveTimeSeconds = 60f;

    private ExperimentData experimentData;
    private List<IDataPersistence> dataPersistenceObjects;
    private FileDataHandler dataHandler;

    private string selectedProfileId = "";

    private Coroutine autoSaveCoroutine;

    public static DataPersistenceManager instance { get; private set; }

    private void Awake()
    {
        if (instance != null)
        {
            Debug.Log("Found more than one Data Persistence Manager in the scene. Destroying the newest one.");
            Destroy(this.gameObject);
            return;
        }
        instance = this;
        DontDestroyOnLoad(this.gameObject);

        if (disableDataPersistence)
        {
            Debug.LogWarning("Data persistence is currently disabled!");
        }

        this.dataHandler = new FileDataHandler(Application.persistentDataPath, fileName);

        InitializeSelectedProfileId();

    }

    private void OnEnable()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;
    }

    private void OnDisable()
    {
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }

    public void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        this.dataPersistenceObjects = FindAllDataPersistenceObjects();
        LoadExperiment();

        //start up auto-saving coroutine
        if (autoSaveCoroutine != null)
        {
            StopCoroutine(autoSaveCoroutine);
        }
        autoSaveCoroutine = StartCoroutine(AutoSave());
    }

    public void ChangeSelectedProfileId(string newProfileId)
    {
        this.selectedProfileId = newProfileId;
        LoadExperiment();
    }

    public void DeleteProfileData(string profileId)
    {
        dataHandler.Delete(profileId);
        InitializeSelectedProfileId();
        LoadExperiment();
    }

    private void InitializeSelectedProfileId()
    {
        if (overrideSelectedProfileId)
        {
            this.selectedProfileId = testSelectedProfileId;
            Debug.LogWarning("Overrode selected profile id with test id: " + testSelectedProfileId);
        } else
        {
            this.selectedProfileId = dataHandler.GetMostRecentlyUpdatedProfileId();
        }
    }

    public void NewExperiment()
    {
        this.experimentData = new ExperimentData();
    }

    public void LoadExperiment()
    {
        if (disableDataPersistence) return;

        // load any saved data from a file
        this.experimentData = dataHandler.Load(selectedProfileId);

        // start a new game if the data is null
        if (this.experimentData == null && initializeDataIfNull)
        {
            NewExperiment();
        }

        // if cannot load game data, do not continue
        if (this.experimentData == null)
        {
            Debug.Log("No data was found. A new experiment must be started before data can be loaded");
            return;
        }


        foreach(IDataPersistence dataPersistenceObj in dataPersistenceObjects)
        {
            dataPersistenceObj.LoadData(experimentData);
        }
    }

    public void SaveExperiment()
    {
        if (disableDataPersistence) return;

        if (this.experimentData == null)
        {
            Debug.LogWarning("No data was found. A new experiment be started before data can be loaded");
            return;
        }

        foreach(IDataPersistence dataPersistenceObj in dataPersistenceObjects)
        {
            dataPersistenceObj.SaveData(experimentData);
        }

        experimentData.lastUpdated = System.DateTime.Now.ToBinary();

        dataHandler.Save(experimentData, selectedProfileId);

    }

    private void OnApplicationQuit()
    {
        SaveExperiment();
    }

    private List<IDataPersistence> FindAllDataPersistenceObjects()
    {
        IEnumerable<IDataPersistence> dataPersistenceObjects = FindObjectsOfType<MonoBehaviour>(true).OfType<IDataPersistence>();

        return new List<IDataPersistence>(dataPersistenceObjects);
    }

    public bool HasExperimentData()
    {
        return experimentData != null;
    }

    public Dictionary<string, ExperimentData> GetAllProfilesExperimentData()
    {
        return dataHandler.LoadAllProfiles();
    }

    private IEnumerator AutoSave()
    { 
        while (true)
        {
            yield return new WaitForSeconds(autoSaveTimeSeconds);
            SaveExperiment();
            Debug.Log("Experiment auto-saved");
        }
    }

}
