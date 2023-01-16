using System.Collections;
using System.Collections.Generic;
using System;
using System.IO;
using UnityEngine;

public class FileDataHandler
{
    private string dataDirPath = "";
    private string dataFileName = "";
    private readonly string backupExtension = ".bak";

    public FileDataHandler(string dataDirPath, string dataFilename)
    {
        this.dataDirPath = dataDirPath;
        this.dataFileName = dataFilename;
    }

    public ExperimentData Load(string profileId, bool allowRestoreFromBackup = true)
    {
        if (profileId == null) { return null; }

        string fullPath = Path.Combine(dataDirPath, profileId, dataFileName);
        ExperimentData loadedData = null;
        if (File.Exists(fullPath))
        {
            try
            {
                string dataToLoad = "";
                using (FileStream stream = new FileStream(fullPath, FileMode.Open))
                {
                    using (StreamReader reader = new StreamReader(stream))
                    {
                        dataToLoad = reader.ReadToEnd();
                    }
                }

                loadedData = JsonUtility.FromJson<ExperimentData>(dataToLoad);
            }
            catch (Exception e)
            {
                if (allowRestoreFromBackup)
                {
                    Debug.LogWarning("Failed to load data file. Attempting to roll back.\n" + e);
                    bool rollbackSuccess = AttemptRollback(fullPath);
                    if (rollbackSuccess)
                    {
                        loadedData = Load(profileId, false);
                    }
                }
                else
                {
                    Debug.LogError("Error occured when trying to load file at path: " + fullPath + " and backup did not work.\n" + e);
                }
            }
        }

        return loadedData;

    }

    public void Save(ExperimentData data, string profileId)
    {
        if (profileId == null) return;

        string fullPath = Path.Combine(dataDirPath, profileId, dataFileName);
        string backupFilePath = fullPath + backupExtension;
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));
            string dataToStore = JsonUtility.ToJson(data, true);

            using (FileStream stream = new FileStream(fullPath, FileMode.Create))
            {
                using (StreamWriter writer = new StreamWriter(stream))
                {
                    writer.Write(dataToStore);
                }
            }

            ExperimentData verifiedExperimentData = Load(profileId);

            if (verifiedExperimentData != null)
            {
                File.Copy(fullPath, backupFilePath, true);
            }
            else
            {
                throw new Exception("Save file could not be verified and backup could not be created");
            }
        }
        catch(Exception e)
        {
            Debug.LogError("Error occured when trying to save data to file: " + fullPath + "\n" + e);
        }
    }

    public void Delete(string profileId)
    {
        if (profileId == null) return;

        string fullPath = Path.Combine(dataDirPath, profileId, dataFileName);
        try
        { 
            if (File.Exists(fullPath))
            {
                Directory.Delete(Path.GetDirectoryName(fullPath), true);
            }
            else
            {
                Debug.LogWarning("Tried to delete profile data, but data was not found at path: " + fullPath);
            }
        }
        catch (Exception e)
        {
            Debug.LogError("Failed to delete profile data for profileId: " + profileId + " at path" + fullPath + "\n" + e);
        }
    }


    public Dictionary<string, ExperimentData> LoadAllProfiles()
    {
        Dictionary<string, ExperimentData> profileDictionary = new Dictionary<string, ExperimentData>();

        IEnumerable<DirectoryInfo> dirInfos = new DirectoryInfo(dataDirPath).EnumerateDirectories();
        foreach(DirectoryInfo dirInfo in dirInfos)
        {
            string profileId = dirInfo.Name;
            string fullPath = Path.Combine(dataDirPath, profileId, dataFileName);
            if (!File.Exists(fullPath))
            {
                Debug.LogWarning("Skipping directory when loading all profiles because it does not contain data: " + profileId);
                continue;
            }

            ExperimentData profileData = Load(profileId);
            if (profileData != null)
            {
                profileDictionary.Add(profileId, profileData);
            } else
            {
                Debug.LogError("Tried to load profile but something went wrong");
            }

        }

        return profileDictionary;
    }

    public string GetMostRecentlyUpdatedProfileId()
    {
        string mostRecentProfileId = null;
        Dictionary<string, ExperimentData> profilesExperimentData = LoadAllProfiles();
        foreach(KeyValuePair<string, ExperimentData> pair in profilesExperimentData)
        {
            string profileId = pair.Key;
            ExperimentData experimentData = pair.Value;

            if (experimentData == null) continue;

            if (mostRecentProfileId == null) continue;
            else
            {
                DateTime mostRecentDateTime = DateTime.FromBinary(profilesExperimentData[mostRecentProfileId].lastUpdated);
                DateTime newDateTime = DateTime.FromBinary(experimentData.lastUpdated);
                if (newDateTime > mostRecentDateTime)
                {
                    mostRecentProfileId = profileId;
                }
            }
        }

        return mostRecentProfileId;
    }

    private bool AttemptRollback(string fullPath)
    {
        bool success = false;
        string backupFilePath = fullPath + backupExtension;
        try
        {
            if (File.Exists(backupFilePath))
            {
                File.Copy(backupFilePath, fullPath, true);
                success = true;
                Debug.LogWarning("Had to roll back to backup file at: " + backupFilePath);
            }
            else
            {
                throw new Exception("Tried to roll back, but no backup file exists to roll back to");
            }
        }
        catch(Exception e)
        {
            Debug.LogError("Error occured when trying to roll back to backup file at: " + backupFilePath + "\n" + e);
        }
        return success;
    }
}
