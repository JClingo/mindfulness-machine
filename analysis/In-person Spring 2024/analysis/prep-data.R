# Load libraries

library(tidyverse)
library(qualtRics)
library(janitor)
library(readr)
library(dplyr)

# Prepare data for analysis from raw Qualtrics result
# Remove unnecessary columns
# Do some manual renaming

df_raw = read_survey('./data/Spring 2024 Data.csv', add_var_labels = FALSE) %>% 
  #filter (Finished == 1) %>%
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
         -DistributionChannel, -UserLanguage, -Consent, -`DAT-Pre-Timing_First Click`, -`DAT-Pre-Timing_Last Click`,
         -`DAT-Pre-Timing_Click Count`, -`Q68_First Click`, -`Q68_Last Click`, -`Q68_Page Submit`, -`Q68_Click Count`,
         -`VMM-Timing_First Click`, -`VMM-Timing_Last Click`, -`VMM-Timing_Click Count`, -`DAT-Post-Timing_First Click`,
         -`DAT-Post-Timing_Last Click`, -`DAT-Post-Timing_Click Count`) %>% 
  rename(
    religious_scale = ReligiousScale_7,
    nausea = Nausea_1,
    dat_post_timing = `DAT-Post-Timing_Page Submit`,
    dat_pre_timing = `DAT-Pre-Timing_Page Submit`,
    vmm_timing = `VMM-Timing_Page Submit`,
    vmm_difficulty = `VMM-Questions_1`,
    vmm_meaning = `VMM-Questions_5`
  )

#normalize the names
df_raw = df_raw %>% janitor::clean_names()

# this participant had to restart so they have two records - we copied the one over but the DAT timings can't be fixed manually
# df_dup = df_raw %>% filter(participant_id == 84391 & finished == 0) # this one was not finished
# 
# # pull duplicate out
# df_raw = df_raw %>% filter(participant_id != 84391 | (participant_id == 84391 & finished == 1))
# 
# df_raw$dat_pre_timing[df_raw$participant_id == 84391] = df_dup$dat_pre_timing




df = df_raw
  
  
# add a special column for whether the Subpac failed
df = df %>% 
  mutate(hasSubpac = 1)





# participants with data collection issues
# 81262 (had to cancel because they refreshed)
df = df %>%
  filter(participant_id != 85690, participant_id != 85579, participant_id != 81262)



# set the subpac-less rows to 0

df$hasSubpac[df$participant_id == 86812 | df$participant_id == 80365 |
               df$participant_id == 81154 | df$participant_id == 84412 |
               df$participant_id == 81772 | df$participant_id == 78310 |
               df$participant_id == 86860 | df$participant_id == 86200 |
               df$participant_id == 86890 | df$participant_id == 85690 |
               df$participant_id == 83512] = 0

#filter out subpac-less data
# df = df %>%
#   filter(hasSubpac == 1)

#df_raw = bind_rows(df_main_raw, df_control_raw, df_baseline_raw)

df = df %>% 
  mutate(has_taken_psychedelic = if_else(psychedelic == 1, 1, 0, 0)) %>% 
  mutate(has_taken_dissociative = if_else(dissociative == 1, 1, 0, 0)) %>% 
  mutate(is_female = if_else(gender == 2, 1, 0, 0)) %>% 
  mutate(wemwbs = (select(., wemwbs_pre_1:wemwbs_pre_14)) %>%  rowSums() / 70) %>%  #normed: 14qs, 1-5 = 70
  mutate(flourishing_scale = (select(., flourishing_scale_pre_1:flourishing_scale_pre_8)) %>% rowSums() / 56) %>% #normed -8qs, 1-7 = 56
  mutate(mlq_pre = ((select(., mlq_pre_1:mlq_pre_9)) %>% rowSums()) / 63) %>% #normed
  mutate(mlq_pre_presence = ((select(., mlq_pre_1, mlq_pre_4, mlq_pre_5, mlq_pre_6)) %>% rowSums() / 28)) %>%  
  mutate(mlq_pre_search = ((select(., mlq_pre_2, mlq_pre_3, mlq_pre_7, mlq_pre_8, mlq_pre_9)) %>% rowSums() / 35)) %>% 
  mutate(mlq_post = ((select(., mlq_post_1:mlq_post_9)) %>% rowSums()) / 63) %>%
  mutate(mlq_post_presence = ((select(., mlq_post_1, mlq_post_4, mlq_post_5, mlq_post_6)) %>% rowSums()) / 28) %>%  
  mutate(mlq_post_search = ((select(., mlq_post_2, mlq_post_3, mlq_post_7, mlq_post_8, mlq_post_9)) %>% rowSums()) / 35) %>%
  mutate(wcs_pre_self = ((wcs_pre_2 + wcs_pre_3 + wcs_pre_4 + wcs_pre_5 + wcs_pre_6 + wcs_pre_7) / 7) * (1 / 7)) %>%
  mutate(wcs_pre_others = ((8 - wcs_pre_1 + 8 - wcs_pre_8 + 8 - wcs_pre_12 + 8 - wcs_pre_13 + wcs_pre_9 + wcs_pre_10) / 7) * (1 / 7)) %>% 
  mutate(wcs_pre_world = ((wcs_pre_11 + wcs_pre_14 + wcs_pre_15 + wcs_pre_16 + wcs_pre_17 + wcs_pre_18 + wcs_pre_19) / 8) * (1 / 7)) %>%
  mutate(wcs_post_self = ((wcs_post_2 + wcs_post_3 + wcs_post_4 + wcs_post_5 + wcs_post_6 + wcs_post_7) / 7) * (1 / 7)) %>%
  mutate(wcs_post_others = ((8 - wcs_post_1 + 8 - wcs_post_8 + 8 - wcs_post_12 + 8 - wcs_post_13 + wcs_post_9 + wcs_post_10) / 7) * (1 / 7)) %>% 
  mutate(wcs_post_world = ((wcs_post_11 + wcs_post_14 + wcs_post_15 + wcs_post_16 + wcs_post_17 + wcs_post_18 + wcs_post_19) / 8) * (1 / 7)) %>%
  mutate(tas = ((select(., modified_tas_1:modified_tas_34)) %>% rowSums()) / 170) %>%  #normed - max tas == 170
  mutate(vas_bowdle = select(., vas_bowdle_post_1:vas_bowdle_post_12) %>% rowSums() / 60) %>% #normed 5-point Likert 5 * 12 
  mutate(stai_pre = (stai_pre_3 + stai_pre_4 + stai_pre_6 + stai_pre_7 + stai_pre_9 + stai_pre_10 + stai_pre_12 + stai_pre_13 + stai_pre_14 + stai_pre_17 + stai_pre_18 + stai_pre_21 + stai_pre_23 + 
           5 - stai_pre_1 + 5 - stai_pre_2 + 5 - stai_pre_5 + 5 - stai_pre_8 + 5 - stai_pre_11 + 5 - stai_pre_15 + 5 - stai_pre_16 + 5 - stai_pre_19 + 5 - stai_pre_20 + 5 - stai_pre_22) / 92) %>%  # 92 is the max score, 23 is the min
  mutate(stai_post = (stai_post_3 + stai_post_4 + stai_post_6 + stai_post_7 + stai_post_9 + stai_post_10 + stai_post_12 + stai_post_13 + stai_post_14 + stai_post_17 + stai_post_18 + stai_post_21 + stai_post_23 + 
                       5 - stai_post_1 + 5 - stai_post_2 + 5 - stai_post_5 + 5 - stai_post_8 + 5 - stai_post_11 + 5 - stai_post_15 + 5 - stai_post_16 + 5 - stai_post_19 + 5 - stai_post_20 + 5 - stai_post_22) / 92) %>%  # 92 is the max score, 23 is the min
  mutate(phq_pre = (select(., phq_pre_1:phq_pre_9) %>% rowSums() - 9) / 27) %>%  # each one scored 0-3 (minus 9 to norm to 0-3 from 1-4, then norm to 0-1)
  mutate(edi = select(., edi_1:edi_8) %>% rowSums() / 8) %>%  # edi is avg of all 8 responses
  mutate(asc = select(., asc_short_1:asc_short_11) %>%  rowSums() / 11) %>% # 5D-ASC - 11 responses - getting avg
  mutate(trance = select(., trance_1: trance_3) %>% rowSums()) %>% # shouldn't be summed/averaged but here it is anyway
  mutate(dat_timing_diff = dat_post_timing - dat_pre_timing)
# TODO: ASC, Trance
# TODO: Figure out norming for wcs

df = df %>% 
  mutate(mlq_diff = (mlq_post - mlq_pre)) %>% 
  mutate(wcs_pre = (wcs_pre_self + wcs_pre_others + wcs_pre_world) / 3) %>%  # from normed values
  mutate(wcs_post = (wcs_post_self + wcs_post_others + wcs_post_world) / 3) %>%  # from normed values
  mutate(wcs_diff = wcs_pre - wcs_post) %>% 
  mutate(stai_diff = stai_post - stai_pre)
  
df$condition = recode(df$condition, '1' = 'Hopalong', '2' = "Factory")

df$condition = as.factor(df$condition)
df$gender = as.factor(df$gender)
df$psychedelic = as.factor(df$psychedelic)
df$has_taken_psychedelic = as.factor(df$has_taken_psychedelic)
df$has_taken_dissociative = as.factor(df$has_taken_dissociative)
df$is_female = as.factor(df$is_female)

# df$MLQ = as.factor(df$MLQ)
# df$MLQ_Presence = as.factor(df$MLQ_Presence)
# df$MLQ_Search = as.factor(df$MLQ_Search)
# 
# df$AWE = as.factor(df$AWE)
# df$AWE_Time = as.factor(df$AWE_Time)
# df$AWE_SelfLoss = as.factor(df$AWE_SelfLoss)
# df$AWE_Connectedness = as.factor(df$AWE_Connectedness)


df_dat_pre = read_tsv('./data/dat_pre_scored.tsv') %>%
  clean_names() %>% 
  select(id, dat) %>% 
  rename(participant_id = id, dat_pre = dat)

df_dat_post = read_tsv('./data/dat_post_scored.tsv') %>%
  clean_names() %>% 
  select(id, dat) %>% 
  rename(participant_id = id, dat_post = dat)

df_p_dat = read_tsv('./data/p_dat_scored.tsv') %>%
  clean_names() %>% 
  select(id, dat) %>% 
  rename(participant_id = id, p_dat = dat)

df = left_join(df, df_dat_pre, by = "participant_id") 
df = left_join(df, df_dat_post, by = "participant_id")
df = left_join(df, df_p_dat, by = "participant_id")

df = df %>% 
  mutate(dat_diff = dat_post - dat_pre) %>% 
  mutate(p_dat_pre_diff = p_dat - dat_pre) %>% 
  mutate(p_dat_post_diff = p_dat - dat_post)

df = df %>% 
  mutate(combined_diff = abs(stai_diff) + abs(mlq_diff) + abs(dat_diff / 200)) #combined absolute difference, dat normed
  

# follow-up survey

df_post_raw = read_survey('./data/Spring 2024 Follow-up.csv', add_var_labels = FALSE) %>% 
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
         -DistributionChannel, -UserLanguage, -`p_Dat-Timing_First Click`, -`p_Dat-Timing_Last Click`,
         -`p_VMM-Timing_First Click`, -`p_VMM-Timing_Last Click`, -`p_VMM-Timing_Click Count`, -p_Condition, -`p_Dat-Timing_First Click`, -`p_Dat-Timing_Last Click`,
         -`p_Dat-Timing_Click Count`) %>% 
  rename(
    p_dat_timing = `p_Dat-Timing_Page Submit`,
    p_vmm_timing = `p_VMM-Timing_Page Submit`,
    p_vmm_difficulty = `p_VMM-Questions_1`,
    p_vmm_meaning = `p_VMM-Questions_5`,
    participant_id = p_ParticipantID
  )

#normalize the names
df_post_raw = df_post_raw %>% janitor::clean_names()

#filter out trouble cases
# 81772 (too long after the first part)
# 0 (unknown respondents who didn't enter their SONA properly)
df_post_raw = df_post_raw %>% filter(participant_id != 81772, !is.na(participant_id))

#finished pre-processing
df_post = df_post_raw

df_post = df_post %>%
  mutate(p_wemwbs = (select(., p_wemwbs_1:p_wemwbs_14)) %>%  rowSums() / 70) %>%  #normed: 14qs, 1-5 = 70
  mutate(p_flourishing_scale = (select(., p_flourishing_scale_1:p_flourishing_scale_8)) %>% rowSums() / 56) %>% #normed: 8qs, 1-7 = 56
  mutate(p_tas = ((select(., p_modified_tas_1:p_modified_tas_34)) %>% rowSums()) / 170) %>% #normed - max tas == 170
  mutate(p_mlq = ((select(., p_mlq_1:p_mlq_9)) %>% rowSums()) / 63) %>% #normed (1-7, 9 questions)
  mutate(p_wcs_self = ((p_wcs_2 + p_wcs_3 + p_wcs_4 + p_wcs_5 + p_wcs_6 + p_wcs_7) / 7) * (1 / 7)) %>% #normed
  mutate(p_wcs_others = ((8 - p_wcs_1 + 8 - p_wcs_8 + 8 - p_wcs_12 + 8 - p_wcs_13 + p_wcs_9 + p_wcs_10) / 7) * (1 / 7)) %>% #normed
  mutate(p_wcs_world = ((p_wcs_11 + p_wcs_14 + p_wcs_15 + p_wcs_16 + p_wcs_17 + p_wcs_18 + p_wcs_19) / 8) * (1 / 7)) %>% #normed
  mutate(p_stai = (p_stai_3 + p_stai_4 + p_stai_6 + p_stai_7 + p_stai_9 + p_stai_10 + p_stai_12 + p_stai_13 + p_stai_14 + p_stai_17 + p_stai_18 + p_stai_21 + p_stai_23 + 
                       5 - p_stai_1 + 5 - p_stai_2 + 5 - p_stai_5 + 5 - p_stai_8 + 5 - p_stai_11 + 5 - p_stai_15 + 5 - p_stai_16 + 5 - p_stai_19 + 5 - p_stai_20 + 5 - p_stai_22) / 92) %>%  # 92 is the max score, 23 is the min
  mutate(p_phq = (select(., p_phq_1:p_phq_9) %>% rowSums() - 9) / 27) # each one scored 0-3 (minus 9 to norm to 0-3 from 1-4, then norm to 0-1)
  
df_post = df_post %>% 
  mutate(p_wcs = (p_wcs_self + p_wcs_others + p_wcs_world) / 3) # from normed values

df = left_join(df, df_post, by = "participant_id") 

df = df %>%
  mutate(p_mlq_diff = p_mlq - mlq_pre) %>%  # relative to pre-stimulus (baseline)
  mutate(p_tas_diff = p_tas - tas) %>% 
  mutate(p_wcs_diff = p_wcs - wcs_pre) %>% 
  mutate(p_stai_diff = p_stai - stai_pre) %>% 
  mutate(p_phq_diff = p_phq - phq_pre) %>% 
  mutate(p_flourishing_scale_diff = p_flourishing_scale - flourishing_scale) %>% 
  mutate(p_vmm_difficulty_diff = p_vmm_difficulty - vmm_difficulty) %>%
  mutate(p_vmm_meaning_diff = p_vmm_meaning - vmm_meaning) %>%
  mutate(p_wemwbs_diff = p_wemwbs - wemwbs)


# Store the results for analysis

saveRDS(df, file = "./data/raw.rds")

df_factory = df %>% 
  filter(condition == "Factory")
df_hopalong = df %>% 
  filter(condition == "Hopalong")

# df[duplicated(df$participant_id), ]
