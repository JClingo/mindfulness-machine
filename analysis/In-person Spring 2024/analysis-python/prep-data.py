import pandas as pd
import numpy as np 
import janitor

# %% 
# %matplotlib inline

#%%

# Fixing the row_sum_norm function to handle missing columns gracefully
# Helper function for row sum normalization
def row_sum_norm(df, col_prefix, start, end, denom):
    cols = [f"{col_prefix}_{i}" for i in range(start, end + 1)]
    # Ensure only existing columns are used
    existing_cols = [col for col in cols if col in df.columns]
    if not existing_cols:
        raise ValueError(f"No matching columns found for prefix {col_prefix} in the specified range.")
    return df[existing_cols].sum(axis=1) / denom

# ----------------------------
# Load and process raw Qualtrics data
# ----------------------------
# Read CSV (using pandas instead of qualtRics::read_survey)
df_raw = pd.read_csv('./data/data.csv')

# Drop unnecessary columns (errors='ignore' in case some names differ)
cols_to_drop = [
    'StartDate', 'EndDate', 'Status', 'IPAddress', 'Progress',
    'Duration (in seconds)', 'RecordedDate', 'ResponseId',
    'RecipientLastName', 'RecipientFirstName', 'RecipientEmail',
    'ExternalReference', 'LocationLatitude', 'LocationLongitude',
    'DistributionChannel', 'UserLanguage', 'Consent',
    'DAT-Pre-Timing_First Click', 'DAT-Pre-Timing_Last Click',
    'DAT-Pre-Timing_Click Count', 'Q68_First Click', 'Q68_Last Click',
    'Q68_Page Submit', 'Q68_Click Count',
    'VMM-Timing_First Click', 'VMM-Timing_Last Click', 'VMM-Timing_Click Count',
    'DAT-Post-Timing_First Click', 'DAT-Post-Timing_Last Click', 'DAT-Post-Timing_Click Count'
]
df_raw.drop(columns=cols_to_drop, inplace=True, errors='ignore')

# Rename selected columns
rename_dict = {
    'ReligiousScale_7': 'religious_scale',
    'Nausea_1': 'nausea',
    'DAT-Post-Timing_Page Submit': 'dat_post_timing',
    'DAT-Pre-Timing_Page Submit': 'dat_pre_timing',
    'VMM-Timing_Page Submit': 'vmm_timing',
    'VMM-Questions_1': 'vmm_difficulty',
    'VMM-Questions_5': 'vmm_meaning'
}
df_raw.rename(columns=rename_dict, inplace=True)

# Clean column names using pyjanitor (convert to snake_case, lower-case, etc.)
df_raw = df_raw.clean_names(case_type='snake')

# (The duplicate-participant code has been commented out in R, so we skip that step)

# Copy processed data to df
df = df_raw.copy()

# ----------------------------
# Add a column for Subpac status and filter out known issues
# ----------------------------
df['hassubpac'] = 1

# Remove participants with data collection issues
df = df[~df['participant_id'].isin([85690, 85579, 81262])]

# Set subpac-less rows to 0
subpac_less_ids = [86812, 80365, 81154, 84412, 81772, 78310, 86860, 86200, 86890, 85690, 83512]
df.loc[df['participant_id'].isin(subpac_less_ids), 'hassubpac'] = 0

# ----------------------------
# Create computed/covariate columns
# ----------------------------
df['has_taken_psychedelic'] = np.where(df['psychedelic'] == 1, 1, 0)
df['has_taken_dissociative'] = np.where(df['dissociative'] == 1, 1, 0)
df['is_female'] = np.where(df['gender'] == 2, 1, 0)

# Calculate composite scores using helper function and direct arithmetic

# %%

# %%

df['flourishing_scale'] = row_sum_norm(df, 'flourishing_scale_pre', 1, 8, 56)
df['wemwbs'] = row_sum_norm(df, 'wemwbs_pre', 1, 14, 70)
df['mlq_pre'] = row_sum_norm(df, 'mlq_pre', 1, 9, 63)
df['mlq_pre_presence'] = df[['mlq_pre_1', 'mlq_pre_4', 'mlq_pre_5', 'mlq_pre_6']].sum(axis=1) / 28
df['mlq_pre_search'] = df[['mlq_pre_2', 'mlq_pre_3', 'mlq_pre_7', 'mlq_pre_8', 'mlq_pre_9']].sum(axis=1) / 35
df['mlq_post'] = row_sum_norm(df, 'mlq_post', 1, 9, 63)
df['mlq_post_presence'] = df[['mlq_post_1', 'mlq_post_4', 'mlq_post_5', 'mlq_post_6']].sum(axis=1) / 28
df['mlq_post_search'] = df[['mlq_post_2', 'mlq_post_3', 'mlq_post_7', 'mlq_post_8', 'mlq_post_9']].sum(axis=1) / 35

df['wcs_pre_self'] = ((df['wcs_pre_2'] + df['wcs_pre_3'] + df['wcs_pre_4'] +
                         df['wcs_pre_5'] + df['wcs_pre_6'] + df['wcs_pre_7']) / 7) * (1/7)
df['wcs_pre_others'] = ((8 - df['wcs_pre_1'] + 8 - df['wcs_pre_8'] +
                           8 - df['wcs_pre_12'] + 8 - df['wcs_pre_13'] +
                           df['wcs_pre_9'] + df['wcs_pre_10']) / 7) * (1/7)
df['wcs_pre_world'] = ((df['wcs_pre_11'] + df['wcs_pre_14'] + df['wcs_pre_15'] +
                          df['wcs_pre_16'] + df['wcs_pre_17'] + df['wcs_pre_18'] +
                          df['wcs_pre_19']) / 8) * (1/7)

df['wcs_post_self'] = ((df['wcs_post_2'] + df['wcs_post_3'] + df['wcs_post_4'] +
                          df['wcs_post_5'] + df['wcs_post_6'] + df['wcs_post_7']) / 7) * (1/7)
df['wcs_post_others'] = ((8 - df['wcs_post_1'] + 8 - df['wcs_post_8'] +
                           8 - df['wcs_post_12'] + 8 - df['wcs_post_13'] +
                           df['wcs_post_9'] + df['wcs_post_10']) / 7) * (1/7)
df['wcs_post_world'] = ((df['wcs_post_11'] + df['wcs_post_14'] + df['wcs_post_15'] +
                          df['wcs_post_16'] + df['wcs_post_17'] + df['wcs_post_18'] +
                          df['wcs_post_19']) / 8) * (1/7)

df['tas'] = row_sum_norm(df, 'modified_tas', 1, 34, 170)
df['vas_bowdle'] = row_sum_norm(df, 'vas_bowdle_post', 1, 12, 60)

# STAI computations (summing selected columns and reverse-scoring others)
stai_pre_cols = ['stai_pre_3', 'stai_pre_4', 'stai_pre_6', 'stai_pre_7',
                 'stai_pre_9', 'stai_pre_10', 'stai_pre_12', 'stai_pre_13',
                 'stai_pre_14', 'stai_pre_17', 'stai_pre_18', 'stai_pre_21', 'stai_pre_23']
stai_pre_rev = ['stai_pre_1', 'stai_pre_2', 'stai_pre_5', 'stai_pre_8',
                'stai_pre_11', 'stai_pre_15', 'stai_pre_16', 'stai_pre_19',
                'stai_pre_20', 'stai_pre_22']
df['stai_pre'] = (df[stai_pre_cols].sum(axis=1) +
                  (5 - df[stai_pre_rev]).sum(axis=1)) / 92

stai_post_cols = ['stai_post_3', 'stai_post_4', 'stai_post_6', 'stai_post_7',
                  'stai_post_9', 'stai_post_10', 'stai_post_12', 'stai_post_13',
                  'stai_post_14', 'stai_post_17', 'stai_post_18', 'stai_post_21', 'stai_post_23']
stai_post_rev = ['stai_post_1', 'stai_post_2', 'stai_post_5', 'stai_post_8',
                 'stai_post_11', 'stai_post_15', 'stai_post_16', 'stai_post_19',
                 'stai_post_20', 'stai_post_22']
df['stai_post'] = (df[stai_post_cols].sum(axis=1) +
                   (5 - df[stai_post_rev]).sum(axis=1)) / 92

# PHQ pre: (sum of phq_pre columns - 9) / 27
phq_cols = [f'phq_pre_{i}' for i in range(1, 10)]
df['phq_pre'] = (df[phq_cols].sum(axis=1) - 9) / 27

# EDI: average of edi_1 to edi_8
edi_cols = [f'edi_{i}' for i in range(1, 9)]
df['edi'] = df[edi_cols].sum(axis=1) / 8

# ASC: average of asc_short_1 to asc_short_11
asc_cols = [f'asc_short_{i}' for i in range(1, 12)]
df['asc'] = df[asc_cols].sum(axis=1) / 11

# Trance: sum of trance_1, trance_2 and trance_3
trance_cols = [f'trance_{i}' for i in range(1, 4)]
df['trance'] = df[trance_cols].sum(axis=1)

# VMM meaning and difficulty, normed
df['vmm_meaning'] = df['vmm_meaning'] / 10
df['vmm_difficulty'] = df['vmm_difficulty'] / 10

# DAT timing difference
df['dat_timing_diff'] = df['dat_post_timing'] - df['dat_pre_timing']

# Compute additional differences
df['mlq_diff'] = df['mlq_post'] - df['mlq_pre']
df['wcs_pre'] = (df['wcs_pre_self'] + df['wcs_pre_others'] + df['wcs_pre_world']) / 3
df['wcs_post'] = (df['wcs_post_self'] + df['wcs_post_others'] + df['wcs_post_world']) / 3
df['wcs_diff'] = df['wcs_pre'] - df['wcs_post']
df['stai_diff'] = df['stai_post'] - df['stai_pre']

# Recode condition: map '1' -> 'Hopalong', '2' -> 'Factory'
df['condition'] = df['condition'].map({1: 'hopalong', 2: 'factory'})
df['condition'] = df['condition'].astype('category')

# Convert other variables to categorical
for col in ['gender', 'psychedelic', 'has_taken_psychedelic',
            'has_taken_dissociative', 'is_female']:
    df[col] = df[col].astype('category')

# ----------------------------
# Merge additional DAT and p_dat scores from TSV files
# ----------------------------
df_dat_pre = pd.read_csv('./data/dat_pre_scored.tsv', sep='\t')
df_dat_pre = df_dat_pre.clean_names()
df_dat_pre = df_dat_pre[['id', 'dat']].rename(columns={'id': 'participant_id', 'dat': 'dat_pre'})
# normalize
df_dat_pre['dat_pre'] = df_dat_pre['dat_pre'].div(200.0, fill_value=np.nan)

df_dat_post = pd.read_csv('./data/dat_post_scored.tsv', sep='\t')
df_dat_post = df_dat_post.clean_names()
df_dat_post = df_dat_post[['id', 'dat']].rename(columns={'id': 'participant_id', 'dat': 'dat_post'})
# normalize
df_dat_post['dat_post'] = df_dat_post['dat_post'].div(200.0, fill_value=np.nan)

df_p_dat = pd.read_csv('./data/p_dat_scored.tsv', sep='\t')
df_p_dat = df_p_dat.clean_names()
df_p_dat = df_p_dat[['id', 'dat']].rename(columns={'id': 'participant_id', 'dat': 'p_dat'})
# normalize
df_p_dat['p_dat'] = df_p_dat['p_dat'].div(200.0, fill_value=np.nan)

# Merge on participant_id
df = df.merge(df_dat_pre, on='participant_id', how='left')
df = df.merge(df_dat_post, on='participant_id', how='left')
df = df.merge(df_p_dat, on='participant_id', how='left')

df['dat_diff'] = df['dat_post'] - df['dat_pre']
df['p_dat_pre_diff'] = df['p_dat'] - df['dat_pre']
df['p_dat_post_diff'] = df['p_dat'] - df['dat_post']

df['combined_diff'] = abs(df['stai_diff']) + abs(df['mlq_diff']) + abs(df['dat_diff'] / 200)

# ----------------------------
# Process follow-up survey data
# ----------------------------
df_post_raw = pd.read_csv('./data/data_follow-up.csv')
cols_to_drop_post = [
    'StartDate', 'EndDate', 'Status', 'IPAddress', 'Progress',
    'Duration (in seconds)', 'Finished', 'RecordedDate', 'ResponseId',
    'RecipientLastName', 'RecipientFirstName', 'RecipientEmail',
    'ExternalReference', 'LocationLatitude', 'LocationLongitude',
    'DistributionChannel', 'UserLanguage',
    'p_Dat-Timing_First Click', 'p_Dat-Timing_Last Click', 'p_VMM-Timing_First Click',
    'p_VMM-Timing_Last Click', 'p_VMM-Timing_Click Count', 'p_Condition',
    'p_Dat-Timing_First Click', 'p_Dat-Timing_Last Click', 'p_Dat-Timing_Click Count'
]
df_post_raw.drop(columns=cols_to_drop_post, inplace=True, errors='ignore')
rename_post = {
    'p_Dat-Timing_Page Submit': 'p_dat_timing',
    'p_VMM-Timing_Page Submit': 'p_vmm_timing',
    'p_VMM-Questions_1': 'p_vmm_difficulty',
    'p_VMM-Questions_5': 'p_vmm_meaning',
    'p_ParticipantID': 'participant_id'
}
df_post_raw.rename(columns=rename_post, inplace=True)
df_post_raw = df_post_raw.clean_names()

# Remove trouble cases (participant_id 81772 and missing participant_id)
df_post_raw = df_post_raw[(df_post_raw['participant_id'] != 81772) & (df_post_raw['participant_id'].notnull())]

df_post = df_post_raw.copy()
df_post['p_wemwbs'] = row_sum_norm(df_post, 'p_wemwbs', 1, 14, 70)
df_post['p_flourishing_scale'] = row_sum_norm(df_post, 'p_flourishingscale', 1, 8, 56)
df_post['p_tas'] = row_sum_norm(df_post, 'p_modified_tas', 1, 34, 170)
df_post['p_mlq'] = row_sum_norm(df_post, 'p_mlq', 1, 9, 63)
df_post['p_wcs_self'] = ((df_post['p_wcs_2'] + df_post['p_wcs_3'] + df_post['p_wcs_4'] +
                           df_post['p_wcs_5'] + df_post['p_wcs_6'] + df_post['p_wcs_7']) / 7) * (1/7)
df_post['p_wcs_others'] = ((8 - df_post['p_wcs_1'] + 8 - df_post['p_wcs_8'] +
                             8 - df_post['p_wcs_12'] + 8 - df_post['p_wcs_13'] +
                             df_post['p_wcs_9'] + df_post['p_wcs_10']) / 7) * (1/7)
df_post['p_wcs_world'] = ((df_post['p_wcs_11'] + df_post['p_wcs_14'] + df_post['p_wcs_15'] +
                            df_post['p_wcs_16'] + df_post['p_wcs_17'] + df_post['p_wcs_18'] +
                            df_post['p_wcs_19']) / 8) * (1/7)

# p_stai: calculating similar to STAI above
p_stai_cols = ['p_stai_3', 'p_stai_4', 'p_stai_6', 'p_stai_7',
               'p_stai_9', 'p_stai_10', 'p_stai_12', 'p_stai_13',
               'p_stai_14', 'p_stai_17', 'p_stai_18', 'p_stai_21', 'p_stai_23']
p_stai_rev = ['p_stai_1', 'p_stai_2', 'p_stai_5', 'p_stai_8',
              'p_stai_11', 'p_stai_15', 'p_stai_16', 'p_stai_19',
              'p_stai_20', 'p_stai_22']
df_post['p_stai'] = (df_post[p_stai_cols].sum(axis=1) +
                     (5 - df_post[p_stai_rev]).sum(axis=1)) / 92

p_phq_cols = [f'p_phq_{i}' for i in range(1, 10)]
df_post['p_phq'] = (df_post[p_phq_cols].sum(axis=1) - 9) / 27
df_post['p_wcs'] = (df_post['p_wcs_self'] + df_post['p_wcs_others'] + df_post['p_wcs_world']) / 3
# VMM meaning normed
df_post['p_vmm_meaning'] = df_post['p_vmm_meaning'] / 10
df_post['p_vmm_difficulty'] = df_post['p_vmm_difficulty'] / 10

# Merge follow-up survey data into main dataframe
df = df.merge(df_post, on='participant_id', how='left')

df['p_mlq_diff_pre'] = df['p_mlq'] - df['mlq_pre']
df['p_mlq_diff_post'] = df['p_mlq'] - df['mlq_post']
df['p_tas_diff'] = df['p_tas'] - df['tas']
df['p_wcs_diff_pre'] = df['p_wcs'] - df['wcs_pre']
df['p_wcs_diff_post'] = df['p_wcs'] - df['wcs_post']
df['p_stai_diff_pre'] = df['p_stai'] - df['stai_pre']
df['p_stai_diff_post'] = df['p_stai'] - df['stai_post']
df['p_phq_diff'] = df['p_phq'] - df['phq_pre']
df['p_flourishing_scale_diff'] = df['p_flourishing_scale'] - df['flourishing_scale']
df['p_vmm_difficulty_diff'] = df['p_vmm_difficulty'] - df['vmm_difficulty']
df['p_vmm_meaning_diff'] = df['p_vmm_meaning'] - df['vmm_meaning']
df['p_vmm_timing_diff'] = df['p_vmm_timing'] - df['vmm_timing']
df['p_wemwbs_diff'] = df['p_wemwbs'] - df['wemwbs']
df['p_dat_timing_diff_pre'] = df['p_dat_timing'] - df['dat_pre_timing']
df['p_dat_timing_diff_post'] = df['p_dat_timing'] - df['dat_post_timing'] 
df['tas_diff'] = df['p_tas'] - df['tas']

# ----------------------------
# Save the processed dataframe for later analysis
# ----------------------------
df.to_pickle('./data/raw.pkl')

# Create condition-specific dataframes if needed
df_factory = df[df['condition'] == 'factory']
df_hopalong = df[df['condition'] == 'hopalong']

# Optional: check for duplicates
# duplicates = df[df.duplicated('participant_id', keep=False)]
# print(duplicates)