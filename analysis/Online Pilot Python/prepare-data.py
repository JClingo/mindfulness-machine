import pandas as pd
import numpy as np

# Helper function to read and clean survey data
def read_and_clean(path, condition_val, extra_filters=None, drop_cols=None, extra_mutate=None):
    df = pd.read_csv(path)  # Qualtrics files usually have metadata in the first row
    df = df[df['Finished'] == 1]
    if extra_filters:
        df = df.query(extra_filters)
    df['Condition'] = condition_val
    if extra_mutate:
        for k, v in extra_mutate.items():
            df[k] = v
    if drop_cols:
        df = df.drop(columns=drop_cols, errors='ignore')
    return df

# Columns to drop
cols_to_drop = [
    'StartDate', 'EndDate', 'Status', 'IPAddress', 'Progress', 'Duration (in seconds)',
    'Finished', 'RecordedDate', 'ResponseId', 'RecipientLastName', 'RecipientFirstName',
    'RecipientEmail', 'ExternalReference', 'LocationLatitude', 'LocationLongitude',
    'DistributionChannel', 'UserLanguage'
]

# Read and clean datasets
df_main_raw = read_and_clean(
    './data/Mindfulness+Machine+-+Main+Condition_August+25,+2022_18.20.csv',
    condition_val=0,
    drop_cols=cols_to_drop
)

df_control_raw = read_and_clean(
    './data/Mindfulness+Machine+-+Control+Condition_August+25,+2022_18.21.csv',
    condition_val=1,
    drop_cols=cols_to_drop
)

cols_to_drop_baseline = cols_to_drop + ['Consent-Simple']
df_baseline_raw = read_and_clean(
    './data/Mindfulness+Machine+-+Baseline_August+22,+2022_15.00.csv',
    condition_val=2,
    extra_filters='`Consent-Simple` == 1',
    drop_cols=cols_to_drop_baseline,
    extra_mutate={'ParticipantID': 0}
)

# Combine all data
df_raw = pd.concat([df_main_raw, df_control_raw, df_baseline_raw], ignore_index=True)

# Feature engineering
df = df_raw.copy()
df['ID'] = np.arange(1, len(df) + 1)
df['HasTakenPsychedelic'] = (df['Psychedelic'] == 1).astype(int)
df['IsFemale'] = (df['Gender'] == 2).astype(int)

# MLQ and AWE Scoring
df['MLQ'] = df.loc[:, 'MLQ_1':'MLQ_10'].drop(columns='MLQ_9', errors='ignore').sum(axis=1, skipna=True) - df.get('MLQ_9', 0)
df['MLQ_Presence'] = df[['MLQ_1', 'MLQ_4', 'MLQ_5', 'MLQ_6', 'MLQ_8', 'MLQ_9']].sum(axis=1, skipna=True)
df['MLQ_Search'] = df[['MLQ_2', 'MLQ_3', 'MLQ_7', 'MLQ_8', 'MLQ_10']].sum(axis=1, skipna=True)
df['AWE'] = df.loc[:, 'AWE_1':'AWE_15'].sum(axis=1, skipna=True)
df['AWE_Time'] = df.loc[:, 'AWE_1':'AWE_5'].sum(axis=1, skipna=True)
df['AWE_SelfLoss'] = df.loc[:, 'AWE_5':'AWE_10'].sum(axis=1, skipna=True)
df['AWE_Connectedness'] = df.loc[:, 'AWE_11':'AWE_15'].sum(axis=1, skipna=True)
df['IsBeliever'] = (df['ReligiousScale'] >= 50).astype(int)

# Convert selected columns to category
df['Gender'] = df['Gender'].astype('category')
df['Psychedelic'] = df['Psychedelic'].astype('category')
df['HasTakenPsychedelic'] = df['HasTakenPsychedelic'].astype('category')
df['IsFemale'] = df['IsFemale'].astype('category')

# Save to RDS-equivalent using pickle
import pickle
with open('./data/raw.pkl', 'wb') as f:
    pickle.dump(df, f)
