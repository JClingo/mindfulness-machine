library(tidyverse)
# library(lme4)
library(lsr)
library(corrplot)
library(ggeffects)
library(Hmisc)
library(ggplot2)
library(ggthemes)
library(ggpubr)
library(svglite)
library(broom)
library(AICcmodavg)
library(dplyr)
library(lme4)
library(PerformanceAnalytics)

options(mc.cores = parallel::detectCores())
theme_set(theme_classic()) 
set.seed(123)

filename = file.choose()
df = readRDS(filename)

#conditional -- test whether filtering out the trouble participants has any real effect, overall
# these are clear cases of bad data
# df = df %>%
#   filter(participant_id != 85690, participant_id != 85579)

#conditional -- these are trouble cases (many where SubPac went wrong)
# df = df %>% 
#   filter(participant_id != 86812, participant_id != 81154, 
#          participant_id != 81772, participant_id != 84352, 
#          participant_id != 86860, participant_id != 86200,
#          participant_id != 83512)

## One-way ANOVA


anova.stai = aov = aov(stai_post ~ condition, data = df)
summary(anova.stai)

plot(df$stai_post, df$condition)

stai_summary = group_by(df, condition) %>% 
  summarise(mean = mean(stai_post), sd = sd(stai_post), n = n())
View(stai_summary)


stai_summary = group_by(df, condition) %>% 
  summarise(mean = mean(p_vmm_difficulty_diff, na.rm = TRUE), sd = sd(p_vmm_difficulty_diff, na.rm = TRUE), n = n())
View(stai_summary)

TukeyHSD(anova.stai)

boxplot((p_wemwbs_diff)~condition, data = df)
t.test((p_wemwbs_diff)~condition,data=df)

# Investigate nausea vs measures

ggplot(df, aes(x = nausea, y = stai_post)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# this one is weird - nausea leads to more meaning in the factory condition
ggplot(df, aes(x = nausea, y = vmm_meaning)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

ggplot(df, aes(x = nausea, y = mlq_post)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# also weird - dat goes up with nausea in hopalong (but it's also that there's much more variance)
ggplot(df, aes(x = nausea, y = dat_post)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

ggplot(df, aes(x = stai_post, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# weird - nausea only increases with stai in hopalong - other condition is stays flat (though this could be due to anxiety changes being higher in the hopalong)
ggplot(df, aes(x = stai_diff, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# really weird but interesting - ego death decreases nausea in the hopalong and increases it in the factory (getting lost good in a good place bad in a factory)
image = ggplot(df, aes(x = edi, y = nausea, color = condition)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition)) + 
  ggtitle("EDI vs Nausea") +
  xlab("EDI") +
  ylab("Nausea") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)

ggplot(df, aes(x = vas_bowdle, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# also weird (same as with edi, less nausea with more asc)
ggplot(df, aes(x = asc, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

ggplot(df, aes(x = trance, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition))

# just for fun - apparently nausea doesn't lower (it slightly increases) DAT scores
ggplot(df, aes(x = dat_post, y = nausea)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition)) + scale_color_tableau() +
  theme_clean()


# ! NOTE: DAT spread is actually quite different between conditions -- worth investigating! (FK yeah!)


# mixed-effects (controlling for things)

lme_model = lmer(stai_post ~ condition + (1 | tas), data = df)
summary(lme_model)





image = ggplot(df, aes(x=condition, y=wcs_diff, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("WCS change") +
  xlab("Condition") +
  ylab("WCS change (post - pre)") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)


image = ggplot(df, aes(x=condition, y=mlq_diff, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("MLQ change") +
  xlab("Condition") +
  ylab("MLQ change (post - pre)") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)



boxplot(wcs_diff~condition,data=df, main="WCS Diff Per Condition",
        xlab="Condition", ylab="WCS")

boxplot(wcs_post~condition, data=df)

regressor = lm(formula = wcs_diff ~ condition + tas, data = df)
summary(regressor)


t.test((wcs_post - wcs_pre)~condition,data=df)

boxplot((mlq_post - mlq_pre)~condition,data=df, main="MLQ Diff Per Condition",
        xlab="Condition", ylab="MLQ")

boxplot(mlq_post~condition, data=df)

t.test((mlq_post - mlq_pre)~condition,data=df)

boxplot((stai_post - stai_pre)~condition,data=df, main="STAI Diff Per Condition",
        xlab="Condition", ylab="STAI")

boxplot(stai_pre~condition, data=df)

boxplot(stai_post~condition, data=df)
t.test(stai_post~condition, data=df)


image = ggplot(df, aes(x=condition, y=stai_diff, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("STAI change") +
  xlab("Condition") +
  ylab("STAI change (post - pre)") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)

boxplot(stai_diff~condition, data=df)
t.test((stai_diff)~condition,data=df)

boxplot(vmm_difficulty~condition,data=df, main="VMM Difficulty by Condition",
        xlab="Condition", ylab="Difficulty of description")

t.test(vmm_difficulty~condition,data=df)

boxplot(vmm_meaning~condition,data=df, main="VMM Meaning by Condition",
        xlab="Condition", ylab="Meaningfulness of images")

t.test(vmm_meaning~condition,data=df)


image = ggplot(df, aes(x=condition, y=vmm_meaning, color=condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1, outlier.colour="red", outlier.shape=8, outlier.size=4) + 
  ggtitle("VMM meaning") +
  xlab("Condition") +
  ylab("VMM meaning") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)



boxplot(vas_bowdle_post_1~condition, data = df) #body altered
boxplot(vas_bowdle_post_2~condition, data = df) #surroundings altered
boxplot(vas_bowdle_post_3~condition, data = df) #time altered
boxplot(vas_bowdle_post_4~condition, data = df) #unreality
boxplot(vas_bowdle_post_5~condition, data = df) #difficulty controlling thoughts
boxplot(vas_bowdle_post_6~condition, data = df) #colors changed
boxplot(vas_bowdle_post_7~condition, data = df) #sound
boxplot(vas_bowdle_post_8~condition, data = df) #hearing voices
boxplot(vas_bowdle_post_9~condition, data = df) #more/more personal meaning
boxplot(vas_bowdle_post_10~condition, data = df) #suspicion
boxplot(vas_bowdle_post_11~condition, data = df) #high
t.test(vas_bowdle_post_11~condition,data=df) #strongly significant
boxplot(vas_bowdle_post_12~condition, data = df) #drowsy
t.test(vas_bowdle_post_12~condition,data=df) # not quite significant but surprising


image = ggplot(df, aes(x=condition, y=vas_bowdle, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("VAS-Bowdle") +
  xlab("Condition") +
  ylab("VAS-Bowdle score") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)

# SIGNIFICANT
boxplot(vas_bowdle~condition, data = df)
t.test(vas_bowdle~condition,data=df)

image = ggplot(df, aes(x=condition, y=edi, color=condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("EDI") +
  xlab("Condition") +
  ylab("EDI score") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)

# SIGNIFICANT
boxplot(edi~condition, data = df) 
t.test(edi~condition,data=df)

# (super) significant
cor.test(df$tas, df$vmm_meaning)
plot(df$tas, df$vmm_meaning)


image = ggplot(df, aes(x=condition, y=asc, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("ASC") +
  xlab("Condition") +
  ylab("ASC score") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)

# not significant (?) interesting!
boxplot(asc~condition, data = df) 

image = ggplot(df, aes(x=condition, y=trance, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) + 
  ggtitle("Trance") +
  xlab("Condition") +
  ylab("Trance score") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)


image = ggplot(df, aes(x=condition, y=dat_diff, color = condition)) + 
  geom_violin(trim = FALSE) +
  geom_boxplot(width=0.1) +
  ggtitle("DAT change") +
  xlab("Condition") +
  ylab("DAT change") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=8, height=8)


# not significant (?) interesting!
boxplot(trance~condition, data = df)
t.test(trance~condition,data=df)

ggplot(df, aes(x = tas, y = combined_diff)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition)) + 
  ggtitle("TAS vs STAI by condition") +
  xlab("TAS") +
  ylab("Trance score") +
  scale_color_tableau() +
  theme_clean(base_size = 18) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

# combined change for all pre-post measures
image = ggplot(df, aes(x = tas, y = combined_diff, color = condition)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition)) + 
  ggtitle("Absolute change vs Absorption") +
  xlab("Absorption (TAS)") +
  ylab("Change in MLQ + STAI + DAT") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=12, height=8)


image = ggplot(df, aes(x = tas, y = vmm_meaning, color = condition)) +
  geom_point(aes(color = factor(condition))) +
  stat_smooth(method = "lm", col = "#C42126", se = TRUE, size = 1) +
  facet_wrap(vars(condition)) + 
  ggtitle("Meaning-making vs Absorption") +
  xlab("Absorption (TAS)") +
  ylab("VMM Meaning Score") +
  scale_color_tableau() +
  theme_clean(base_size = 32) + 
  theme(plot.background = element_rect(color = NA), legend.position = "none")

ggsave(file="image.png", plot=image, width=12, height=8)

#check for Subpac effects
boxplot(vas_bowdle_post_1~hasSubpac, data = df) #body altered
boxplot(vas_bowdle_post_2~hasSubpac, data = df) #surroundings altered
boxplot(vas_bowdle_post_3~hasSubpac, data = df) #time altered
boxplot(vas_bowdle_post_4~hasSubpac, data = df) #unreality
boxplot(vas_bowdle_post_5~hasSubpac, data = df) #difficulty controlling thoughts
boxplot(vas_bowdle_post_6~hasSubpac, data = df) #colors changed
boxplot(vas_bowdle_post_7~hasSubpac, data = df) #sound
boxplot(vas_bowdle_post_8~hasSubpac, data = df) #hearing voices
boxplot(vas_bowdle_post_9~hasSubpac, data = df) #more/more personal meaning
boxplot(vas_bowdle_post_10~hasSubpac, data = df) #suspicion
boxplot(vas_bowdle_post_11~hasSubpac, data = df) #high
boxplot(vas_bowdle_post_12~hasSubpac, data = df) #drowsy


# main vs follow-up

# DAT
boxplot((dat_diff)~condition, data = df)
boxplot((p_dat_pre_diff)~condition, data = df)
boxplot((p_dat_post_diff)~condition, data = df)

mean(df$dat_post, na.rm = TRUE)
mean(df$dat_pre, na.rm = TRUE)
mean(df$p_dat, na.rm = TRUE)
# woah, that's remarkably consistent!



boxplot((p_mlq_diff)~condition, data = df)
boxplot((p_tas_diff)~condition, data = df)
boxplot((p_wcs_diff)~condition, data = df)
boxplot((p_stai_diff)~condition, data = df)
boxplot((p_phq_diff)~condition, data = df)

boxplot(p_flourishing_scale_diff~condition,data=df, main="Post-pre Flourishing Per Condition",
        xlab="Condition", ylab="Flourishing")

boxplot((p_wemwbs_diff)~condition, data = df)

boxplot(p_vmm_meaning_diff~condition, data = df)









# from http://www.sthda.com/english/wiki/correlation-matrix-a-quick-start-guide-to-analyze-format-and-visualize-a-correlation-matrix-using-r-software

flattenCorrMatrix <- function(cormat, pmat) {
  ut <- upper.tri(cormat)
  data.frame(
    row = rownames(cormat)[row(cormat)[ut]],
    column = rownames(cormat)[col(cormat)[ut]],
    cor = (cormat)[ut],
    p = pmat[ut]
  )
}

# some correlations, just to see

df_correlations = df %>% 
  select(mlq_diff, wcs_diff, tas, stai_pre, phq_pre, condition, edi, has_taken_psychedelic, has_taken_dissociative, dat_diff, dat_timing_diff, religious_scale, vmm_timing, vmm_difficulty, vmm_meaning)


res2 = rcorr(as.matrix(df_correlations))

flattenCorrMatrix(res2$r, res2$P)

df_correlations = df %>% 
  select(tas, stai_pre, phq_pre, p_stai_diff, p_phq_diff)


res2 = rcorr(as.matrix(df_correlations))

flattenCorrMatrix(res2$r, res2$P)

mean(df$p_phq_diff, na.rm = TRUE)
mean(df$phq_pre, na.rm = TRUE)
mean(df$p_phq, na.rm = TRUE)

df_pre_corr = df %>% 
  select(.,mlq_pre, p_mlq, wcs_pre, p_wcs, tas, p_tas, vmm_meaning, p_vmm_meaning, flourishing_scale, p_flourishing_scale, wemwbs, p_wemwbs, stai_pre, p_stai, phq_pre, p_phq)

res2 = rcorr(as.matrix(df_pre_corr))

flattenCorrMatrix(res2$r, res2$P)

chart.Correlation(df_pre_corr, histogram=TRUE, pch=19)


df_pre_corr = df %>% 
  select(.,tas, p_tas, vmm_meaning, p_vmm_meaning, stai_pre, p_stai, phq_pre, p_phq)

res2 = rcorr(as.matrix(df_pre_corr))

flattenCorrMatrix(res2$r, res2$P)

col<- colorRampPalette(c("blue", "white", "red"))(20)
heatmap(x = df_correlations, col = col, symm = TRUE)


  


df_correlations[] <- lapply(df_pre_corr,as.integer)
res1 <- cor.mtest(df_correlations, conf.level = .95)
## specialized the insignificant value according to the significant level
corrplot(cor(df_correlations), p.mat = res1$p, insig = "label_sig",
         sig.level = c(.001, .01, .05), pch.cex = .9, pch.col = "white")


df_correlations = df %>% 
  select(condition, MEQ_Score, ReligiousScale, `Duration (in seconds)`, IsFemale, Education, Psychedelic)
df_correlations[] <- lapply(df_correlations,as.integer)
res1 <- cor.mtest(df_correlations, conf.level = .95)
## specialized the insignificant value according to the significant level
corrplot(cor(df_correlations), p.mat = res1$p, insig = "label_sig",
         sig.level = c(.001, .01, .05), pch.cex = .9, pch.col = "white")

mean(df_hopalong$nausea, na.rm = TRUE) 
mean(df_factory$nausea, na.rm = TRUE) 


