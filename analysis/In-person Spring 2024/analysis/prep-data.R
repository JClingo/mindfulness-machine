# Load libraries

library(tidyverse)
library(qualtRics)
library(janitor)

# Prepare data for analysis from raw Qualtrics result
# Remove unnecessary columns

df_raw = read_survey('./data/MM+Spring+2024_April+10,+2024_22.21.csv', add_var_labels = FALSE) %>% 
  filter (Finished == 1) %>%
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
         -DistributionChannel, -UserLanguage, -Consent, -`Dat-Pre-Timing_First Click`, -`Dat-Pre-Timing_Last Click`,
         -`Dat-Pre-Timing_Click Count`, -`Q68_First Click`, -`Q68_Last Click`, -`Q68_Page Submit`, -`Q68_Click Count`,
         -`VMM-Timing_First Click`, -`VMM-Timing_Last Click`, -`VMM-Timing_Click Count`, -`DAT-Post-Timing_First Click`,
         -`DAT-Post-Timing_Last Click`, -`DAT-Post-Timing_Click Count`) %>% 
  rename(
    religious_scale = ReligiousScale_7,
    nausea = Nausea_1,
    dat_post_timing = `DAT-Post-Timing_Page Submit`,
    dat_pre_timing = `Dat-Pre-Timing_Page Submit`,
    vmm_timing = `VMM-Timing_Page Submit`
  )

df_raw_clean = df_raw %>% janitor::clean_names()
  

#df_raw = bind_rows(df_main_raw, df_control_raw, df_baseline_raw)

df_raw_clean %>% select(., mlq_pre_1:mlq_pre_9) %>% rowSums()

df = df_raw_clean %>% 
  mutate(has_taken_psychedelic = if_else(psychedelic == 1, 1, 0, 0)) %>% 
  mutate(has_taken_dissociative = if_else(dissociative == 1, 1, 0, 0)) %>% 
  mutate(is_female = if_else(gender == 2, 1, 0, 0)) %>% 
  mutate(mlq_pre = (select(., mlq_pre_1:mlq_pre_9)) %>% rowSums()) %>%
  mutate(mlq_pre_presence = (select(., mlq_pre_1, mlq_pre_4, mlq_pre_5, mlq_pre_6)) %>% rowSums()) %>%  
  mutate(mlq_pre_search = (select(., mlq_pre_2, mlq_pre_3, mlq_pre_7, mlq_pre_8, mlq_pre_9)) %>% rowSums()) %>% 
  mutate(mlq_post = (select(., mlq_post_1:mlq_post_9)) %>% rowSums()) %>%
  mutate(mlq_post_presence = (select(., mlq_post_1, mlq_post_4, mlq_post_5, mlq_post_6)) %>% rowSums()) %>%  
  mutate(mlq_post_search = (select(., mlq_post_2, mlq_post_3, mlq_post_7, mlq_post_8, mlq_post_9)) %>% rowSums()) %>% 
  mutate(tas = (select(., modified_tas_1:modified_tas_34)) %>% rowSums())

df_hopalong = df %>% filter(condition = 1)
df_factory = df %>% filter(condition = 2)

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




# df$Mystical1_1 = as.factor(df$Mystical1_1)

# Store the results for analysis

saveRDS(df, file = "./data/raw.rds")


