# %% 

import pandas as pd
from scipy import stats
from scipy.stats import wilcoxon
from statsmodels.stats.multitest import multipletests
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf
import pingouin as pg
from pathlib import Path
from statsmodels.stats.power import TTestIndPower, FTestAnovaPower

# Set random seed for reproducibility
np.random.seed(123)

# Set the style for plots
plt.style.use('ggplot')
sns.set_theme(style="whitegrid")

data_path = Path('data/raw.pkl')
df = pd.read_pickle(data_path)
# df = pd.read_csv(data_path, sep='\t')

# Optional: Filter out trouble participants (didn't follow instructions)
trouble_ids = [85690, 85579]
df = df[~df['participant_id'].isin(trouble_ids)]

# Optional: More trouble cases where SubPac went wrong
trouble_subpac = [86812, 81154, 81772, 84352, 86860, 86200, 83512]
df = df[~df['participant_id'].isin(trouble_subpac)]


df_hopalong = df[df['condition'] == 'hopalong']
df_factory = df[df['condition'] == 'factory']

# %%

# Pre vs Post

# Store results globally for FDR correction
results = []

def calc_wilcoxon(source_df, condition, column_pre, column_post):
    # Filter out NaN values
    mask = ~np.isnan(source_df[column_pre]) & ~np.isnan(source_df[column_post])
    df_clean = source_df[mask]

    # Compute differences and perform Wilcoxon test
    differences = df_clean[column_post] - df_clean[column_pre]
    statistic, p_value = wilcoxon(differences)

    # Get number of non-zero differences
    non_zero_diffs = differences[differences != 0]
    n = len(non_zero_diffs)

    # Calculate rank biserial correlation
    max_rank_sum = n * (n + 1) / 2
    r_rb = 1 - (2 * statistic) / max_rank_sum

    print(f"\nWilcoxon test for {column_pre} vs {column_post} for {condition}:")
    print(f"Wilcoxon statistic: {statistic}")
    print(f"Raw P-value: {p_value:.9f}")
    print(f"Rank biserial correlation: {r_rb:.3f}")

    results.append({'comparison': f"{column_pre} vs {column_post}", 'p_value': p_value})

# Run tests
calc_wilcoxon(df_factory, 'factory', 'dat_pre', 'dat_post')
calc_wilcoxon(df_factory, 'factory', 'dat_pre_timing', 'dat_post_timing')
calc_wilcoxon(df_factory, 'factory', 'mlq_pre', 'mlq_post')
calc_wilcoxon(df_factory, 'factory', 'wcs_pre', 'wcs_post')
calc_wilcoxon(df_factory, 'factory', 'stai_pre', 'stai_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'dat_pre', 'dat_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'dat_pre_timing', 'dat_post_timing')
calc_wilcoxon(df_hopalong, 'hopalong', 'mlq_pre', 'mlq_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'wcs_pre', 'wcs_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'stai_pre', 'stai_post')
calc_wilcoxon(df, 'both', 'dat_pre', 'dat_post')
calc_wilcoxon(df, 'both', 'dat_pre_timing', 'dat_post_timing')
calc_wilcoxon(df, 'both', 'mlq_pre', 'mlq_post')
calc_wilcoxon(df, 'both', 'wcs_pre', 'wcs_post')
calc_wilcoxon(df, 'both', 'stai_pre', 'stai_post')

# FDR Correction
p_values = [res['p_value'] for res in results]
_, corrected_pvals, _, _ = multipletests(p_values, method='fdr_bh')

print()

# Display corrected p-values
for res, corrected_p in zip(results, corrected_pvals):
    print(f"FDR-corrected p-value for {res['comparison']}: {corrected_p:.9f}")

# %%

# pre vs follow-up

# Store results globally for FDR correction
results = []

def calc_wilcoxon(source_df, condition, column_pre, column_post):
    # Filter out NaN values
    mask = ~np.isnan(source_df[column_pre]) & ~np.isnan(source_df[column_post])
    df_clean = source_df[mask]

    # Compute differences and perform Wilcoxon test
    differences = df_clean[column_post] - df_clean[column_pre]
    statistic, p_value = wilcoxon(differences)

    # Get number of non-zero differences
    non_zero_diffs = differences[differences != 0]
    n = len(non_zero_diffs)

    # Calculate rank biserial correlation
    max_rank_sum = n * (n + 1) / 2
    r_rb = 1 - (2 * statistic) / max_rank_sum

    print(f"\nWilcoxon test for {column_pre} vs {column_post} for {condition}:")
    print(f"Wilcoxon statistic: {statistic}")
    print(f"Raw P-value: {p_value:.9f}")
    print(f"Rank biserial correlation: {r_rb:.3f}")

    results.append({'comparison': f"{column_pre} vs {column_post}", 'p_value': p_value})

# Run tests

calc_wilcoxon(df_hopalong, 'hopalong', 'tas', 'p_tas')
calc_wilcoxon(df_hopalong, 'hopalong', 'stai_pre', 'p_stai' )
calc_wilcoxon(df_hopalong, 'hopalong', 'phq_pre', 'p_phq')
calc_wilcoxon(df_hopalong, 'hopalong', 'wemwbs', 'p_wemwbs')
calc_wilcoxon(df_hopalong, 'hopalong', 'flourishing_scale', 'p_flourishing_scale')
calc_wilcoxon(df_hopalong, 'hopalong', 'wcs_pre', 'p_wcs', )
calc_wilcoxon(df_hopalong, 'hopalong', 'mlq_pre', 'p_mlq')
calc_wilcoxon(df_hopalong, 'hopalong', 'dat_pre', 'p_dat')
calc_wilcoxon(df_hopalong, 'hopalong', 'dat_pre_timing', 'p_dat_timing')

calc_wilcoxon(df_factory, 'factory', 'tas', 'p_tas')
calc_wilcoxon(df_factory, 'factory', 'stai_pre', 'p_stai' )
calc_wilcoxon(df_factory, 'factory', 'phq_pre', 'p_phq')
calc_wilcoxon(df_factory, 'factory', 'wemwbs', 'p_wemwbs')
calc_wilcoxon(df_factory, 'factory', 'flourishing_scale', 'p_flourishing_scale')
calc_wilcoxon(df_factory, 'factory', 'wcs_pre', 'p_wcs', )
calc_wilcoxon(df_factory, 'factory', 'mlq_pre', 'p_mlq')
calc_wilcoxon(df_factory, 'factory', 'dat_pre', 'p_dat')
calc_wilcoxon(df_factory, 'factory', 'dat_pre_timing', 'p_dat_timing')

calc_wilcoxon(df, 'both', 'tas', 'p_tas')
calc_wilcoxon(df, 'both', 'stai_pre', 'p_stai' )
calc_wilcoxon(df, 'both', 'phq_pre', 'p_phq')
calc_wilcoxon(df, 'both', 'wemwbs', 'p_wemwbs')
calc_wilcoxon(df, 'both', 'flourishing_scale', 'p_flourishing_scale')
calc_wilcoxon(df, 'both', 'wcs_pre', 'p_wcs', )
calc_wilcoxon(df, 'both', 'mlq_pre', 'p_mlq')
calc_wilcoxon(df, 'both', 'dat_pre', 'p_dat')
calc_wilcoxon(df, 'both', 'dat_pre_timing', 'p_dat_timing')



# FDR Correction
p_values = [res['p_value'] for res in results]
_, corrected_pvals, _, _ = multipletests(p_values, method='fdr_bh')

print()

# Display corrected p-values
for res, corrected_p in zip(results, corrected_pvals):
    print(f"FDR-corrected p-value for {res['comparison']}: {corrected_p:.9f}")


# %%

# post vs follow-up

# Store results globally for FDR correction
results = []

def calc_wilcoxon(source_df, condition, column_pre, column_post):
    # Filter out NaN values
    mask = ~np.isnan(source_df[column_pre]) & ~np.isnan(source_df[column_post])
    df_clean = source_df[mask]

    # Compute differences and perform Wilcoxon test
    differences = df_clean[column_post] - df_clean[column_pre]
    statistic, p_value = wilcoxon(differences)

    # Get number of non-zero differences
    non_zero_diffs = differences[differences != 0]
    n = len(non_zero_diffs)

    # Calculate rank biserial correlation
    max_rank_sum = n * (n + 1) / 2
    r_rb = 1 - (2 * statistic) / max_rank_sum

    print(f"\nWilcoxon test for {column_pre} vs {column_post} for {condition}:")
    print(f"Wilcoxon statistic: {statistic}")
    print(f"Raw P-value: {p_value:.9f}")
    print(f"Rank biserial correlation: {r_rb:.3f}")

    results.append({'comparison': f"{column_pre} vs {column_post}", 'p_value': p_value})

# Run tests


calc_wilcoxon(df_hopalong, 'hopalong', 'p_stai', 'stai_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_wcs', 'wcs_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_mlq', 'mlq_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_vmm_meaning', 'vmm_meaning')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_vmm_difficulty', 'vmm_difficulty')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_vmm_timing', 'vmm_timing')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_dat', 'dat_post')
calc_wilcoxon(df_hopalong, 'hopalong', 'p_dat_timing', 'dat_post_timing')

calc_wilcoxon(df_factory, 'factory', 'p_stai', 'stai_post')
calc_wilcoxon(df_factory, 'factory', 'p_wcs', 'wcs_post')
calc_wilcoxon(df_factory, 'factory', 'p_mlq', 'mlq_post')
calc_wilcoxon(df_factory, 'factory', 'p_vmm_meaning', 'vmm_meaning')
calc_wilcoxon(df_factory, 'factory', 'p_vmm_difficulty', 'vmm_difficulty')
calc_wilcoxon(df_factory, 'factory', 'p_vmm_timing', 'vmm_timing')
calc_wilcoxon(df_factory, 'factory', 'p_dat', 'dat_post')
calc_wilcoxon(df_factory, 'factory', 'p_dat_timing', 'dat_post_timing')

calc_wilcoxon(df, 'both', 'p_stai', 'stai_post')
calc_wilcoxon(df, 'both', 'p_wcs', 'wcs_post')
calc_wilcoxon(df, 'both', 'p_mlq', 'mlq_post')
calc_wilcoxon(df, 'both', 'p_vmm_meaning', 'vmm_meaning')
calc_wilcoxon(df, 'both', 'p_vmm_difficulty', 'vmm_difficulty')
calc_wilcoxon(df, 'both', 'p_vmm_timing', 'vmm_timing')
calc_wilcoxon(df, 'both', 'p_dat', 'dat_post')
calc_wilcoxon(df, 'both', 'p_dat_timing', 'dat_post_timing')

# FDR Correction
p_values = [res['p_value'] for res in results]
_, corrected_pvals, _, _ = multipletests(p_values, method='fdr_bh')

print()

# Display corrected p-values
for res, corrected_p in zip(results, corrected_pvals):
    print(f"FDR-corrected p-value for {res['comparison']}: {corrected_p:.9f}")



# %%

# One-way ANOVA for STAI with detailed reporting
print("\nOne-way ANOVA for STAI (model: stai_post ~ condition):")
stai_anova = stats.f_oneway(
    df[df['condition'] == 'hopalong']['stai_post'],
    df[df['condition'] == 'factory']['stai_post']
)
# Degrees of freedom
n1 = df[df['condition'] == 'hopalong']['stai_post'].dropna().shape[0]
n2 = df[df['condition'] == 'factory']['stai_post'].dropna().shape[0]
print(f"Degrees of freedom: df1 = {n1 - 1}, df2 = {n2 - 1}")
df1 = 1
# total n - groups
df2 = n1 + n2 - 2
# Effect size: eta squared
ss_between = ((df[df['condition'] == 'hopalong']['stai_post'].mean() - df['stai_post'].mean())**2 * n1 +
              (df[df['condition'] == 'factory']['stai_post'].mean() - df['stai_post'].mean())**2 * n2)
ss_total = ((df['stai_post'] - df['stai_post'].mean())**2).sum()
eta_sq = ss_between / ss_total if ss_total > 0 else float('nan')
print(f"F({df1}, {df2}) = {stai_anova.statistic:.4f}, p = {stai_anova.pvalue:.4f}, eta² = {eta_sq:.3f}")

# %%

# Summary statistics for STAI
stai_summary = df.groupby('condition')['stai_post'].agg(['mean', 'std', 'count'])
print("\nSTAI Summary by condition:")
print(stai_summary)

# %%

# VMM difficulty summary
vmm_summary = df.groupby('condition')['p_vmm_difficulty_diff'].agg(['mean', 'std', 'count'])
print("\nVMM Difficulty Summary by condition:")
print(vmm_summary)

# %%

# T-test for WEMWBS
wemwbs_ttest = stats.ttest_ind(
    df[df['condition'] == 'hopalong']['p_wemwbs_diff'],
    df[df['condition'] == 'factory']['p_wemwbs_diff']
)
print("\nt-test results for WEMWBS difference:")
print(f"t-statistic: {wemwbs_ttest.statistic:.4f}")
print(f"p-value: {wemwbs_ttest.pvalue:.4f}")

# %%

# Function to create violin plots with boxplots
def create_violin_plot(data, y_var, title, ylabel):
    plt.figure(figsize=(8, 8))
    sns.violinplot(data=data, x='condition', y=y_var, inner='box')
    plt.title(title, fontsize=16)
    plt.xlabel('Condition', fontsize=14)
    plt.ylabel(ylabel, fontsize=14)
    plt.savefig(f'plots/{y_var}_plot.png', bbox_inches='tight', dpi=300)
    plt.close()

# Create various violin plots
plots_config = [
    ('wcs_diff', 'WCS change', 'WCS change (post - pre)'),
    ('mlq_diff', 'MLQ change', 'MLQ change (post - pre)'),
    ('stai_diff', 'STAI change', 'STAI change (post - pre)'),
    ('vmm_meaning', 'VMM meaning', 'VMM meaning'),
    ('vas_bowdle', 'VAS-Bowdle', 'VAS-Bowdle score'),
    ('edi', 'EDI', 'EDI score'),
    ('asc', 'ASC', 'ASC score'),
    ('trance', 'Trance', 'Trance score'),
    ('dat_diff', 'DAT change', 'DAT change')
]

for var, title, ylabel in plots_config:
    create_violin_plot(df, var, title, ylabel)

# %%

# Correlation analysis
correlation_vars = ['mlq_diff', 'wcs_diff', 'tas', 'stai_pre', 'phq_pre', 
                   'edi', 'has_taken_psychedelic', 'has_taken_dissociative',
                   'dat_diff', 'dat_timing_diff', 'religious_scale', 
                   'vmm_timing', 'vmm_difficulty', 'vmm_meaning']

corr_df = df[correlation_vars]
correlation_matrix = corr_df.corr()

# Create correlation heatmap
plt.figure(figsize=(12, 10))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.tight_layout()
plt.savefig('plots/correlation_heatmap.png', bbox_inches='tight', dpi=300)
plt.close()

# %%


# TAS vs VMM meaning correlation test
tas_vmm_corr = stats.pearsonr(df['tas'], df['vmm_meaning'])
print("\nTAS vs VMM meaning correlation:")
print(f"r: {tas_vmm_corr[0]:.4f}")
print(f"p-value: {tas_vmm_corr[1]:.4f}")

# Create scatter plot with regression line for TAS vs combined_diff by condition
plt.figure(figsize=(12, 8))
sns.lmplot(data=df, x='tas', y='combined_diff', hue='condition', 
           col='condition', height=6, aspect=0.8)
plt.suptitle('Absolute change vs Absorption', y=1.02, fontsize=16)
plt.tight_layout()
plt.savefig('plots/tas_combined_diff_plot.png', bbox_inches='tight', dpi=300)
plt.close()
# Check for Subpac effects
for i in range(1, 13):
    var = f'vas_bowdle_post_{i}'
    group1 = df[df['hassubpac'] == True][var]
    group2 = df[df['hassubpac'] == False][var]
    result = stats.ttest_ind(group1, group2)
    # Calculate Cohen's d
    mean1, mean2 = group1.mean(), group2.mean()
    var1, var2 = group1.var(), group2.var()
    n1, n2 = len(group1), len(group2)
    pooled_sd = np.sqrt(((n1 - 1)*var1 + (n2 - 1)*var2) / (n1 + n2 - 2))
    cohens_d = (mean1 - mean2) / pooled_sd if pooled_sd > 0 else np.nan
    print(f"\nt-test results for {var} by Subpac:")
    print(f"t-statistic: {result.statistic:.4f}")
    print(f"p-value: {result.pvalue:.4f}")
    print(f"Cohen's d: {cohens_d:.3f}")

# Mixed effects model for STAI
model = smf.mixedlm("stai_post ~ condition", data=df, groups="tas")
result = model.fit()
print("\nMixed Effects Model Results:")
print(result.summary())

# ASC correlations with other measures
print("\nCorrelations between ASC and other measures:")
print("=" * 50)

measures_to_test = {
    'mlq_post': 'MLQ Post',
    'wcs_post': 'WCS Post',
    'dat_post': 'DAT Post',
    'stai_pre': 'STAI Pre',
    'phq_pre': 'PHQ Pre'
}

for measure, label in measures_to_test.items():
    # Calculate correlation
    corr = stats.pearsonr(df['asc'], df[measure])
    print(f"\nASC vs {label}:")
    print(f"Correlation: r = {corr[0]:.3f}, p = {corr[1]:.4f}")
    
    # T-test comparing high vs low ASC groups
    asc_median = df['asc'].median()
    high_asc = df[df['asc'] > asc_median][measure]
    low_asc = df[df['asc'] <= asc_median][measure]
    
    ttest = stats.ttest_ind(high_asc, low_asc)
    print(f"High vs Low ASC t-test:")
    print(f"t = {ttest.statistic:.3f}, p = {ttest.pvalue:.4f}")
    
    # Print means for interpretation
    print("Means:")
    print(f"High ASC group (n={len(high_asc)}): {high_asc.mean():.3f} (SD={high_asc.std():.3f})")
    print(f"Low ASC group (n={len(low_asc)}): {low_asc.mean():.3f} (SD={low_asc.std():.3f})")

# Create visualization of relationships
plt.figure(figsize=(15, 10))

for i, (measure, label) in enumerate(measures_to_test.items(), 1):
    plt.subplot(2, 3, i)
    sns.scatterplot(data=df, x='asc', y=measure)
    sns.regplot(data=df, x='asc', y=measure, scatter=False, color='red')
    plt.title(f'ASC vs {label}')
    plt.xlabel('ASC Score')
    plt.ylabel(label)

plt.tight_layout()
plt.savefig('plots/asc_relationships.png', bbox_inches='tight', dpi=300)
plt.close()

# %% Repeated Measures ANOVA Analysis with Significance Highlighting

print("\nPerforming Repeated Measures ANOVA Analysis with Significance Highlighting...")
print("=" * 70)

# Define the measures to analyze
measures = {
    'STAI': ['stai_pre', 'stai_post', 'p_stai'],
    'MLQ': ['mlq_pre', 'mlq_post', 'p_mlq'],
    'WCS': ['wcs_pre', 'wcs_post', 'p_wcs'],
    'DAT': ['dat_pre', 'dat_post', 'p_dat']
}

def analyze_measure_with_significance(df, measure_name, time_columns):
    # Prepare long-format data
    long_data = []
    for subject in df['participant_id'].unique():
        subject_data = df[df['participant_id'] == subject]
        if not subject_data.empty:
            condition = subject_data['condition'].iloc[0]
            for time_idx, col in enumerate(time_columns):
                if col in subject_data.columns:
                    value = subject_data[col].iloc[0]
                    if not pd.isna(value):
                        long_data.append({
                            'participant_id': subject,
                            'condition': condition,
                            'time': time_idx,
                            'value': value
                        })
    
    if not long_data:
        print(f"\n{measure_name}: No valid data available")
        return None, None
        
    long_df = pd.DataFrame(long_data)
    
    try:
        # Perform mixed ANOVA
        aov = pg.mixed_anova(
            data=long_df,
            dv='value',
            within='time',
            between='condition',
            subject='participant_id'
        )
        
        # Check for significant effects
        sig_effects = aov[aov['p-unc'] < 0.05]
        
        if not sig_effects.empty:
            print(f"\n{measure_name} - Significant Effects Found:")
            print("-" * 40)
            
            for idx, effect in sig_effects.iterrows():
                print(f"\n* {effect['Source']} effect:")
                print(f"  F({effect['ddof1']}, {effect['ddof2']}) = {effect['F']:.2f}")
                print(f"  p = {effect['p-unc']:.4f}")
                print(f"  partial η² = {effect['np2']:.3f}")
                
                # Show means for better interpretation
                if effect['Source'] == 'condition':
                    means = long_df.groupby('condition')['value'].mean()
                    print("\n  Condition means:")
                    for cond, mean in means.items():
                        print(f"  - {cond}: {mean:.2f}")
                elif effect['Source'] == 'time':
                    means = long_df.groupby('time')['value'].mean()
                    print("\n  Time point means:")
                    for time, mean in means.items():
                        print(f"  - Time {time}: {mean:.2f}")
                
            # If there are significant effects, perform post-hoc tests
            if 'time' in sig_effects['Source'].values:
                posthoc = pg.pairwise_ttests(
                    data=long_df,
                    dv='value',
                    within='time',
                    subject='participant_id'
                )
                print("\n  Post-hoc tests for time:")
                sig_posthoc = posthoc[posthoc['p-corr'] < 0.05]
                if not sig_posthoc.empty:
                    for _, row in sig_posthoc.iterrows():
                        print(f"  Time {row['A']} vs Time {row['B']}: p = {row['p-corr']:.4f}")
        else:
            print(f"\n{measure_name}: No significant effects found")
        
        return aov, long_df
        
    except Exception as e:
        print(f"\n{measure_name}: Analysis error - {str(e)}")
        return None, None

print("\nSignificant Results Summary:")
print("=" * 50)

all_results = {}
for measure_name, columns in measures.items():
    aov, data = analyze_measure_with_significance(df, measure_name, columns)
    all_results[measure_name] = (aov, data)

# Overall summary
print("\nOverall Summary of Significant Effects:")
print("=" * 50)
significant_measures = []
for measure_name, (aov, _) in all_results.items():
    if aov is not None and any(aov['p-unc'] < 0.05):
        significant_measures.append(measure_name)

if significant_measures:
    print("\nMeasures with significant effects:")
    for measure in significant_measures:
        print(f"- {measure}")
else:
    print("\nNo significant effects found in any measure")

# ASC relationships analysis
print("\nAnalyzing ASC relationships with outcome measures:")
print("=" * 50)

measures = {
    'mlq_post': 'MLQ Post',
    'wcs_post': 'WCS Post',
    'dat_post': 'DAT Post',
    'stai_pre': 'STAI Pre',
    'phq_pre': 'PHQ Pre'
}

# Calculate group means and perform t-tests
for measure, label in measures.items():
    # Split into high/low ASC groups at median
    median_asc = df['asc'].median()
    high_asc = df[df['asc'] > median_asc][measure]
    low_asc = df[df['asc'] <= median_asc][measure]
    
    # Calculate means
    high_mean = high_asc.mean()
    low_mean = low_asc.mean()
    
    # Perform t-test
    t_stat, p_val = stats.ttest_ind(high_asc, low_asc)
    
    print(f"\nASC vs {label}:")
    print(f"High ASC group mean ({len(high_asc)} participants): {high_mean:.3f}")
    print(f"Low ASC group mean ({len(low_asc)} participants): {low_mean:.3f}")
    print(f"t-statistic: {t_stat:.3f}")
    print(f"p-value: {p_val:.3f}")
    
    # Calculate and print effect size (Cohen's d)
    cohens_d = (high_mean - low_mean) / np.sqrt((high_asc.var() + low_asc.var()) / 2)
    print(f"Cohen's d: {cohens_d:.3f}")

    # Create visualization
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='asc', y=measure)
    sns.regplot(data=df, x='asc', y=measure, scatter=False, color='red')
    plt.title(f'ASC vs {label} Relationship')
    plt.xlabel('ASC Score')
    plt.ylabel(label)
    plt.savefig(f'plots/asc_vs_{measure}.png', bbox_inches='tight', dpi=300)
    plt.close()

# VAS-Bowdle relationships analysis
print("\nAnalyzing VAS-Bowdle relationships with outcome measures:")
print("=" * 50)

vas_measures = {
    'mlq_post': 'MLQ Post',
    'wcs_post': 'WCS Post',
    'dat_post': 'DAT Post',
    'stai_pre': 'STAI Pre',
    'phq_pre': 'PHQ Pre'
}

# Calculate group means and perform t-tests
for measure, label in vas_measures.items():
    # Split into high/low VAS-Bowdle groups at median
    median_vas = df['vas_bowdle'].median()
    high_vas = df[df['vas_bowdle'] > median_vas][measure]
    low_vas = df[df['vas_bowdle'] <= median_vas][measure]
    
    # Calculate means
    high_mean = high_vas.mean()
    low_mean = low_vas.mean()
    
    # Perform t-test
    t_stat, p_val = stats.ttest_ind(high_vas, low_vas)
    
    print(f"\nVAS-Bowdle vs {label}:")
    print(f"High VAS-Bowdle group mean ({len(high_vas)} participants): {high_mean:.3f}")
    print(f"Low VAS-Bowdle group mean ({len(low_vas)} participants): {low_mean:.3f}")
    print(f"t-statistic: {t_stat:.3f}")
    print(f"p-value: {p_val:.3f}")
    
    # Calculate and print effect size (Cohen's d)
    cohens_d = (high_mean - low_mean) / np.sqrt((high_vas.var() + low_vas.var()) / 2)
    print(f"Cohen's d: {cohens_d:.3f}")

    # Create visualization
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='vas_bowdle', y=measure)
    sns.regplot(data=df, x='vas_bowdle', y=measure, scatter=False, color='red')
    plt.title(f'VAS-Bowdle vs {label} Relationship')
    plt.xlabel('VAS-Bowdle Score')
    plt.ylabel(label)
    plt.savefig(f'plots/vas_bowdle_vs_{measure}.png', bbox_inches='tight', dpi=300)
    plt.close()

# %% WCS pre, post, follow-up comparison across conditions
print("\nWCS Pre, Post, and Follow-up Comparison Across Conditions:")
print("=" * 60)

# Prepare long-format data for WCS
wcs_long = []
for subject in df['participant_id'].unique():
    subject_data = df[df['participant_id'] == subject]
    if not subject_data.empty:
        condition = subject_data['condition'].iloc[0]
        for time_idx, col in enumerate(['wcs_pre', 'wcs_post', 'p_wcs']):
            if col in subject_data.columns:
                value = subject_data[col].iloc[0]
                if not pd.isna(value):
                    wcs_long.append({
                        'participant_id': subject,
                        'condition': condition,
                        'time': ['pre', 'post', 'followup'][time_idx],
                        'value': value
                    })

wcs_long_df = pd.DataFrame(wcs_long)

# Print group means and SDs for each timepoint by condition
summary = wcs_long_df.groupby(['condition', 'time'])['value'].agg(['mean', 'std', 'count'])
print("\nGroup means and SDs for WCS:")
print(summary)

# Mixed/repeated measures ANOVA
try:
    wcs_aov = pg.mixed_anova(
        data=wcs_long_df,
        dv='value',
        within='time',
        between='condition',
        subject='participant_id'
    )
    print("\nMixed ANOVA Results for WCS:")
    for idx, row in wcs_aov.iterrows():
        # Robust extraction of dfs
        ddof1 = row['ddof1'] if 'ddof1' in row else row.get('DF1', 'NA')
        ddof2 = row['ddof2'] if 'ddof2' in row else row.get('DF2', 'NA')
        print(f"{row['Source']}: F({ddof1}, {ddof2}) = {row['F']:.3f}, p = {row['p-unc']:.4f}, partial η² = {row['np2']:.3f}")
    # Highlight significant effects
    sig = wcs_aov[wcs_aov['p-unc'] < 0.05]
    if not sig.empty:
        print("\nSignificant effects:")
        print(sig[['Source', 'F', 'p-unc', 'np2']])
    else:
        print("\nNo significant effects found.")
except Exception as e:
    print(f"\nWCS ANOVA error: {e}")

# Visualization: line plot of means over time by condition
plt.figure(figsize=(8, 6))
sns.pointplot(data=wcs_long_df, x='time', y='value', hue='condition',
              dodge=True, markers=['o', 's'], capsize=.1, err_kws={'linewidth': 1.5})
plt.title('WCS over Time by Condition')
plt.ylabel('WCS Score')
plt.xlabel('Timepoint')
plt.legend(title='Condition')
plt.tight_layout()
plt.savefig('plots/wcs_time_condition.png', bbox_inches='tight', dpi=300)
plt.close()

# Post-hoc: Between-condition t-tests at each timepoint for WCS
print("\nBetween-condition t-tests for WCS at each timepoint:")
timepoints = ['pre', 'post', 'followup']
for t in timepoints:
    group1 = wcs_long_df[(wcs_long_df['condition'] == 'hopalong') & (wcs_long_df['time'] == t)]['value']
    group2 = wcs_long_df[(wcs_long_df['condition'] == 'factory') & (wcs_long_df['time'] == t)]['value']
    t_stat, p_val = stats.ttest_ind(group1, group2, nan_policy='omit')
    # Cohen's d
    mean1, mean2 = group1.mean(), group2.mean()
    var1, var2 = group1.var(), group2.var()
    n1, n2 = len(group1), len(group2)
    pooled_sd = np.sqrt(((n1 - 1)*var1 + (n2 - 1)*var2) / (n1 + n2 - 2)) if (n1 + n2 - 2) > 0 else np.nan
    cohens_d = (mean1 - mean2) / pooled_sd if pooled_sd > 0 else np.nan
    print(f"\nTimepoint: {t}")
    print(f"Hopalong mean: {mean1:.3f} (n={n1}) | Factory mean: {mean2:.3f} (n={n2})")
    print(f"t-statistic: {t_stat:.3f}, p-value: {p_val:.4f}, Cohen's d: {cohens_d:.3f}")

# %% VMM pre, post, follow-up comparison across conditions
print("\nVMM Pre, Post, and Follow-up Comparison Across Conditions:")
print("=" * 60)

# Prepare long-format data for VMM meaning, difficulty, and timing
vmm_measures = ['vmm_meaning', 'vmm_difficulty', 'vmm_timing']
vmm_long = []
for subject in df['participant_id'].unique():
    subject_data = df[df['participant_id'] == subject]
    if not subject_data.empty:
        condition = subject_data['condition'].iloc[0]
        for vmm in vmm_measures:
            for time_idx, col in enumerate([f'p_{vmm}', vmm]):
                if col in subject_data.columns:
                    value = subject_data[col].iloc[0]
                    if not pd.isna(value):
                        vmm_long.append({
                            'participant_id': subject,
                            'condition': condition,
                            'vmm_type': vmm,
                            'time': ['followup', 'post'][time_idx],
                            'value': value
                        })
vmm_long_df = pd.DataFrame(vmm_long)

# Print group means and SDs for each VMM score by condition and time
summary = vmm_long_df.groupby(['vmm_type', 'condition', 'time'])['value'].agg(['mean', 'std', 'count'])
print("\nGroup means and SDs for VMM scores:")
print(summary)

# Mixed/repeated measures ANOVA for each VMM score
effects_summary = []
for vmm in vmm_measures:
    print(f"\nMixed ANOVA Results for {vmm}:")
    sub_df = vmm_long_df[vmm_long_df['vmm_type'] == vmm]
    try:
        aov = pg.mixed_anova(
            data=sub_df,
            dv='value',
            within='time',
            between='condition',
            subject='participant_id'
        )
        print(aov)
        sig = aov[aov['p-unc'] < 0.05]
        if not sig.empty:
            print("Significant effects:")
            print(sig[['Source', 'F', 'p-unc', 'np2']])
            for _, row in sig.iterrows():
                effects_summary.append({'vmm': vmm, 'Source': row['Source'], 'F': row['F'], 'p': row['p-unc'], 'np2': row['np2']})
        else:
            print("No significant effects found.")
    except Exception as e:
        print(f"{vmm} ANOVA error: {e}")

# Summary of all significant effects
if effects_summary:
    print("\nSummary of significant effects across VMM scores:")
    for eff in effects_summary:
        print(f"{eff['vmm']} - {eff['Source']}: F = {eff['F']:.3f}, p = {eff['p']:.4f}, partial η² = {eff['np2']:.3f}")
else:
    print("\nNo significant effects found for VMM scores.")

# Visualization: line plots for each VMM score over time by condition
for vmm in vmm_measures:
    plt.figure(figsize=(8, 6))
    sub_df = vmm_long_df[vmm_long_df['vmm_type'] == vmm]
    sns.pointplot(data=sub_df, x='time', y='value', hue='condition',
                  dodge=True, markers=['o', 's'], capsize=.1, err_kws={'linewidth': 1.5})
    plt.title(f'{vmm.replace("_", " ").title()} over Time by Condition')
    plt.ylabel(f'{vmm.replace("_", " ").title()}')
    plt.xlabel('Timepoint')
    plt.legend(title='Condition')
    plt.tight_layout()
    plt.savefig(f'plots/{vmm}_time_condition.png', bbox_inches='tight', dpi=300)
    plt.close()

# %% Test interaction between VMM meaning and TAS scores
print("\nTesting interaction between VMM meaning and TAS scores:")
print("=" * 60)

# Mixed effects model: vmm_meaning ~ tas * condition
try:
    model = smf.mixedlm("vmm_meaning ~ tas * condition", data=df, groups="participant_id")
    result = model.fit()
    print(result.summary())
    # Extract and print interaction effect
    if 'tas:condition[T.hopalong]' in result.params.index or 'tas:condition[T.factory]' in result.params.index:
        for cond in df['condition'].unique():
            key = f'tas:condition[T.{cond}]'
            if key in result.params.index:
                print(f"Interaction term for tas × {cond}: coef = {result.params[key]:.4f}, p = {result.pvalues[key]:.4f}")
    else:
        print("No explicit tas:condition interaction term found in model.")
except Exception as e:
    print(f"Error fitting mixed effects model: {e}")

# Visualization: interaction plot
plt.figure(figsize=(8, 6))
sns.lmplot(data=df, x='tas', y='vmm_meaning', hue='condition',
           markers=['o', 's'], aspect=1.2, height=6)
plt.title('Interaction: TAS × Condition on VMM Meaning')
plt.xlabel('TAS Score')
plt.ylabel('VMM Meaning')
plt.tight_layout()
plt.savefig('plots/vmm_meaning_tas_condition_interaction.png', bbox_inches='tight', dpi=300)
plt.close()


# %%


print("\nTesting interaction between VMM meaning and STAI scores:")
print("=" * 60)

# Mixed effects model: vmm_meaning ~ stai_post * condition
try:
    model = smf.mixedlm("vmm_meaning ~ stai_post * condition", data=df, groups="participant_id")
    result = model.fit()
    print(result.summary())
    # Extract and print interaction effect
    if 'stai_post:condition[T.hopalong]' in result.params.index or 'stai_post:condition[T.factory]' in result.params.index:
        for cond in df['condition'].unique():
            key = f'stai_post:condition[T.{cond}]'
            if key in result.params.index:
                print(f"Interaction term for stai_post × {cond}: coef = {result.params[key]:.4f}, p = {result.pvalues[key]:.4f}")
    else:
        print("No explicit stai_post:condition interaction term found in model.")
except Exception as e:
    print(f"Error fitting mixed effects model: {e}")

# Visualization: interaction plot
sns.lmplot(data=df, x='stai_post', y='vmm_meaning', hue='condition',
           markers=['o', 's'], aspect=1.2, height=6)
plt.title('Interaction: STAI × Condition on VMM Meaning')
plt.xlabel('STAI Post Score')
plt.ylabel('VMM Meaning')
plt.tight_layout()
plt.savefig('plots/vmm_meaning_stai_condition_interaction.png', bbox_inches='tight', dpi=300)
plt.close()


# %% Power Analyses for Main Measures
from statsmodels.stats.power import TTestIndPower, FTestAnovaPower

print("\nPower Analyses for Main Measures:")
print("=" * 60)

# Example: Power for between-group t-test (e.g., STAI post)
# Replace these with your observed Cohen's d values for each measure
observed_effect_sizes = {
    'stai_post': 1,  # Example value, replace with your observed Cohen's d
    'mlq_post': 1,
    'wcs_post': 1,
    'vmm_meaning': 1
}

n1 = df[df['condition'] == 'hopalong'].shape[0]
n2 = df[df['condition'] == 'factory'].shape[0]
alpha = 0.05

ttest_power = TTestIndPower()
for measure, d in observed_effect_sizes.items():
    power = ttest_power.solve_power(effect_size=d, nobs1=n1, ratio=n2/n1, alpha=alpha, alternative='two-sided')
    print(f"{measure}: n1={n1}, n2={n2}, d={d:.2f}, power={power:.3f}")

# Example: Power for one-way ANOVA (e.g., STAI post by condition)
anova_power = FTestAnovaPower()
for measure, d in observed_effect_sizes.items():
    # Convert Cohen's d to f (f = d / 2)
    f = d / 2
    n_total = n1 + n2
    power = anova_power.solve_power(effect_size=f, nobs=n_total, k_groups=2, alpha=alpha)
    print(f"{measure} (ANOVA): n={n_total}, f={f:.2f}, power={power:.3f}")

print("\nNote: Replace effect sizes with your observed values for more accurate power estimates.")

# %%
