# %% 

import pandas as pd
from scipy import stats
from scipy.stats import wilcoxon, shapiro, skew, kurtosis
from statsmodels.stats.multitest import multipletests
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, make_scorer
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
from statsmodels.stats.power import TTestIndPower

# %% 

# Set random seed for reproducibility
np.random.seed(123)

# Set the style for plots
plt.style.use('ggplot')
sns.set_theme(style="whitegrid")

data_path = Path('data/raw.pkl')
df = pd.read_pickle(data_path)

# %% 

# Perform t-tests for MLQ across conditions
# Assuming 'Condition' column: 0=Main, 1=Control, 2=Baseline
mlq_main = df[df['Condition'] == 0]['MLQ'].dropna()
mlq_control = df[df['Condition'] == 1]['MLQ'].dropna()
mlq_baseline = df[df['Condition'] == 2]['MLQ'].dropna()

# Main vs Control
t_stat_main_control, p_val_main_control = stats.ttest_ind(mlq_main, mlq_control, equal_var=False)
print(f"MLQ Main vs Control: t={t_stat_main_control:.3f}, p={p_val_main_control:.4f}")

# Main vs Baseline
t_stat_main_baseline, p_val_main_baseline = stats.ttest_ind(mlq_main, mlq_baseline, equal_var=False)
print(f"MLQ Main vs Baseline: t={t_stat_main_baseline:.3f}, p={p_val_main_baseline:.4f}")

# Control vs Baseline
t_stat_control_baseline, p_val_control_baseline = stats.ttest_ind(mlq_control, mlq_baseline, equal_var=False)
print(f"MLQ Control vs Baseline: t={t_stat_control_baseline:.3f}, p={p_val_control_baseline:.4f}")

# -- Normality, Skew, Kurtosis, and Scale Reliability ---
# Test normality for MLQ in each condition
for cond, label in zip([0, 1, 2], ["Main", "Control", "Baseline"]):
    mlq = df[df['Condition'] == cond]['MLQ'].dropna()
    stat, p = shapiro(mlq)
    print(f"Shapiro-Wilk normality test for MLQ ({label}): W={stat:.3f}, p={p:.4f}")
    print(f"  Skew: {skew(mlq):.3f}, Kurtosis: {kurtosis(mlq):.3f}")

# Scale reliability (Cronbach's alpha) for MLQ and AWE
# Helper for Cronbach's alpha

def cronbach_alpha(df_items):
    items = df_items.dropna(axis=0)
    item_vars = items.var(axis=0, ddof=1)
    total_var = items.sum(axis=1).var(ddof=1)
    n_items = items.shape[1]
    if n_items < 2:
        return np.nan
    return (n_items / (n_items - 1)) * (1 - item_vars.sum() / total_var)

mlq_items = [f'MLQ_{i}' for i in range(1, 11)]
mlq_alpha = cronbach_alpha(df[mlq_items])
print(f"Cronbach's alpha for MLQ: {mlq_alpha:.3f}")

awe_items = [f'AWE_{i}' for i in range(1, 16)]
awe_alpha = cronbach_alpha(df[awe_items])
print(f"Cronbach's alpha for AWE: {awe_alpha:.3f}")

# Cronbach's alpha for MLQ and AWE by condition
for cond, label in zip([0, 1, 2], ["Main", "Control", "Baseline"]):
    df_cond = df[df['Condition'] == cond]
    mlq_alpha = cronbach_alpha(df_cond[mlq_items])
    awe_alpha = cronbach_alpha(df_cond[awe_items])
    print(f"Cronbach's alpha for MLQ ({label}): {mlq_alpha:.3f}")
    print(f"Cronbach's alpha for AWE ({label}): {awe_alpha:.3f}")

# %% 

# Perform t-tests for AWE across conditions
# Assuming 'Condition' column: 0=Main, 1=Control, 2=Baseline
awe_main = df[df['Condition'] == 0]['AWE'].dropna()
awe_control = df[df['Condition'] == 1]['AWE'].dropna()
awe_baseline = df[df['Condition'] == 2]['AWE'].dropna()

# Main vs Control
t_stat_awe_main_control, p_val_awe_main_control = stats.ttest_ind(awe_main, awe_control, equal_var=False)
print(f"AWE Main vs Control: t={t_stat_awe_main_control:.3f}, p={p_val_awe_main_control:.4f}")

# Main vs Baseline
t_stat_awe_main_baseline, p_val_awe_main_baseline = stats.ttest_ind(awe_main, awe_baseline, equal_var=False)
print(f"AWE Main vs Baseline: t={t_stat_awe_main_baseline:.3f}, p={p_val_awe_main_baseline:.4f}")

# Control vs Baseline
t_stat_awe_control_baseline, p_val_awe_control_baseline = stats.ttest_ind(awe_control, awe_baseline, equal_var=False)
print(f"AWE Control vs Baseline: t={t_stat_awe_control_baseline:.3f}, p={p_val_awe_control_baseline:.4f}")

# Normality, Skew, Kurtosis for AWE in each condition
for cond, label in zip([0, 1, 2], ["Main", "Control", "Baseline"]):
    awe = df[df['Condition'] == cond]['AWE'].dropna()
    stat, p = shapiro(awe)
    print(f"Shapiro-Wilk normality test for AWE ({label}): W={stat:.3f}, p={p:.4f}")
    print(f"  Skew: {skew(awe):.3f}, Kurtosis: {kurtosis(awe):.3f}")

# %%

#Case where subject reported nausea
reported_nausea = [145317216, 150787919, 104528162, 121475818, 119803467, 150693715, 136011243, 151831974, 192762097]
df_no_nausea = df[~df['ParticipantID'].isin(reported_nausea)]

mlq_main_no_nausea = df_no_nausea[df_no_nausea['Condition'] == 0]['MLQ'].dropna()

t_stat_main_control, p_val_main_control = stats.ttest_ind(mlq_main_no_nausea, mlq_control, equal_var=False)
print(f"MLQ Main vs Control: t={t_stat_main_control:.3f}, p={p_val_main_control:.4f}")

# %% 

# Power analysis for t-test (Main vs Control for MLQ)
power_analysis = TTestIndPower()
# Calculate effect size (Cohen's d)
def cohen_d(x, y):
    nx = len(x)
    ny = len(y)
    dof = nx + ny - 2
    pooled_std = np.sqrt(((nx - 1) * np.std(x, ddof=1) ** 2 + (ny - 1) * np.std(y, ddof=1) ** 2) / dof)
    return (np.mean(x) - np.mean(y)) / pooled_std

d = cohen_d(mlq_main, mlq_control)
n1 = len(mlq_main)
n2 = len(mlq_control)
ratio = n2 / n1
alpha = 0.05
power = power_analysis.power(effect_size=abs(d), nobs1=n1, ratio=ratio, alpha=alpha)
print(f"Power analysis for MLQ Main vs Control: effect size d={d:.3f}, n1={n1}, n2={n2}, power={power:.3f}")
# %%

power_analysis = TTestIndPower()
sample_size = power_analysis.solve_power(effect_size=0.845, power=0.8, alpha=0.05)
sample_size

# %% 

# Power analysis for t-test (Main vs Control for AWE)
d_awe = cohen_d(awe_main, awe_control)
n1_awe = len(awe_main)
n2_awe = len(awe_control)
ratio_awe = n2_awe / n1_awe
power_awe = power_analysis.power(effect_size=abs(d_awe), nobs1=n1_awe, ratio=ratio_awe, alpha=alpha)
print(f"Power analysis for AWE Main vs Control: effect size d={d_awe:.3f}, n1={n1_awe}, n2={n2_awe}, power={power_awe:.3f}")
# %%
