# Load libraries

library(tidyverse)
library(qualtRics)

# Prepare data for analysis from raw Qualtrics result
# Remove unnecessary columns

# 8-14 MLQ Absolutely Untrue-True

df_raw = read_survey('./data/Mindfulness+Machine+-+Main+Condition_August+20,+2022_23.04.csv', add_var_labels = FALSE) %>% 
  filter (Finished == 1) %>% 
  select(-StartDate, -EndDate, -Status, -IPAddress, -Progress, -`Duration (in seconds)`, -Finished, -RecordedDate, -ResponseId,
         -RecipientLastName, -RecipientFirstName, -RecipientEmail, -ExternalReference, -LocationLatitude, -LocationLongitude, 
          -DistributionChannel, -UserLanguage)

# MLQ Scoring - http://www.michaelfsteger.com/wp-content/uploads/2013/12/MLQ-description-scoring-and-feedback-packet.pdf


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

# Time, Self-loss, Connectedness

df$Gender = as.factor(df$Gender)
df$Psychedelic = as.factor(df$Psychedelic)
df$HasTakenPsychedelic = as.factor(df$HasTakenPsychedelic)
df$IsFemale = as.factor(df$IsFemale)



df$Mystical1_1 = as.factor(df$Mystical1_1)
df$Mystical1_2 = as.factor(df$Mystical1_2)
df$Mystical1_3 = as.factor(df$Mystical1_3)
df$Mystical1_4 = as.factor(df$Mystical1_4)
df$Mystical1_5 = as.factor(df$Mystical1_5)
df$Mystical1_6 = as.factor(df$Mystical1_6)
df$Mystical2_1 = as.factor(df$Mystical2_1)
df$Mystical2_2 = as.factor(df$Mystical2_2)
df$Mystical2_3 = as.factor(df$Mystical2_3)
df$Mystical2_4 = as.factor(df$Mystical2_4)
df$Mystical2_5 = as.factor(df$Mystical2_5)
df$Mystical2_6 = as.factor(df$Mystical2_6)
df$Mystical3_1 = as.factor(df$Mystical3_1)
df$Mystical3_2 = as.factor(df$Mystical3_2)
df$Mystical3_3 = as.factor(df$Mystical3_3)
df$Mystical3_4 = as.factor(df$Mystical3_4)
df$Mystical3_5 = as.factor(df$Mystical3_5)
df$Mystical3_6 = as.factor(df$Mystical3_6)
df$Mystical4_1 = as.factor(df$Mystical4_1)
df$Mystical4_2 = as.factor(df$Mystical4_2)
df$Mystical4_3 = as.factor(df$Mystical4_3)
df$Mystical4_4 = as.factor(df$Mystical4_4)
df$Mystical4_5 = as.factor(df$Mystical4_5)
df$Mystical4_6 = as.factor(df$Mystical4_6)
df$Mystical5_1 = as.factor(df$Mystical5_1)
df$Mystical5_2 = as.factor(df$Mystical5_2)
df$Mystical5_3 = as.factor(df$Mystical5_3)
df$Mystical5_4 = as.factor(df$Mystical5_4)
df$Mystical5_5 = as.factor(df$Mystical5_5)
  

# Store the results for analysis

saveRDS(df, file = "./data/main.rds")


