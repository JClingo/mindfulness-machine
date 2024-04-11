# Load libraries

library(tidyverse)
library(qualtRics)

# Prepare data for analysis from raw Qualtrics result
# Remove unnecessary columns

# 8-14 MLQ Absolutely Untrue-True

df_main_raw = read_survey('./data/Mindfulness+Machine+-+Main+Condition_August+25,+2022_18.20.csv', add_var_labels = FALSE) %>% 
  filter (Finished == 1) %>%
  mutate(Condition = 0) %>% 
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
          -DistributionChannel, -UserLanguage)

# MLQ Scoring - http://www.michaelfsteger.com/wp-content/uploads/2013/12/MLQ-description-scoring-and-feedback-packet.pdf

df_control_raw = read_survey('./data/Mindfulness+Machine+-+Control+Condition_August+25,+2022_18.21.csv', add_var_labels = FALSE) %>% 
  filter (Finished == 1) %>% 
  mutate(Condition = 1) %>% 
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
         -DistributionChannel, -UserLanguage)


df_baseline_raw = read_survey('./data/Mindfulness+Machine+-+Baseline_August+22,+2022_15.00.csv', add_var_labels = FALSE) %>% 
  filter (Finished == 1, `Consent-Simple` == 1) %>% 
  mutate(Condition = 2, ParticipantID = 0) %>% 
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
         -DistributionChannel, -UserLanguage, -`Consent-Simple`)

#df_raw = rbind(df_main_raw, df_control_raw, df_baseline_raw)
df_raw = bind_rows(df_main_raw, df_control_raw, df_baseline_raw)

df = df_raw %>% 
  mutate(ID = row_number()) %>% 
  mutate(HasTakenPsychedelic = if_else(Psychedelic == 1, 1, 0, 0)) %>% 
  mutate(IsFemale = if_else(Gender == 2, 1, 0, 0)) %>% 
  mutate(MLQ = (select(., MLQ_1:MLQ_10) %>% select(., -MLQ_9) %>% rowSums(na.rm = TRUE)) - (select(., MLQ_9)) %>% rowSums()) %>%
  mutate(MLQ_Presence = (select(., MLQ_1, MLQ_4, MLQ_5, MLQ_6) %>% rowSums()) + (select(., MLQ_8, MLQ_9)) %>% rowSums()) %>%  
  mutate(MLQ_Search = select(., MLQ_2, MLQ_3, MLQ_7, MLQ_8, MLQ_10) %>% rowSums()) %>%
  mutate(AWE = select(., AWE_1:AWE_15) %>% rowSums(na.rm = TRUE)) %>%
  mutate(AWE_Time = select(., AWE_1:AWE_5) %>% rowSums(na.rm = TRUE)) %>% 
  mutate(AWE_SelfLoss = select(., AWE_5:AWE_10) %>% rowSums(na.rm = TRUE)) %>% 
  mutate(AWE_Connectedness = select(., AWE_11:AWE_15) %>% rowSums(na.rm = TRUE))

df$Gender = as.factor(df$Gender)
df$Psychedelic = as.factor(df$Psychedelic)
df$HasTakenPsychedelic = as.factor(df$HasTakenPsychedelic)
df$IsFemale = as.factor(df$IsFemale)

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


