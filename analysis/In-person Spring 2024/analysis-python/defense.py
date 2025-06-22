import numpy as np
import matplotlib.pyplot as plt

# Data for 12-month relapse rates
treatments = [
    "Psilocybin therapy",
    "CBT (acute)",
    "CBT (maintenance)",
    "Med continued",
    "Med withdrawn",
    "MBCT",
    "TAU"
]
relapse_pct = np.array([25, 30, 31, 47, 76, 36, 78])

# Data for 12-month remission rates (where applicable)
treatments_remission = [
    "Psilocybin therapy",
    "CBT (maintenance)",
    "Med continued",
    "Med withdrawn",
    "MBCT",
    "TAU"
]
remission_pct = np.array([58, 69, 53, 24, 64, 22])

# 1960s-style color palette (earthy and retro tones)
color_map = {
    "Psilocybin therapy": "#D95D39",
    "CBT (acute)": "#FFB140",
    "CBT (maintenance)": "#FFD6A5",
    "Med continued": "#6A994E",
    "Med withdrawn": "#386641",
    "MBCT": "#A7C957",
    "TAU": "#BC4749"
}

# Apply colors to the bars based on treatment order
bar_colors_relapse = [color_map[t] for t in treatments]
bar_colors_remission = [color_map[t] for t in treatments_remission]

# Plot settings for clean style
fig, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor='white')

# Plot 1: Relapse rates bar chart
ax = axes[0]
ax.set_facecolor('white')
bars = ax.bar(treatments, relapse_pct, color=bar_colors_relapse)
ax.set_ylim(0, 100)
ax.set_ylabel('Relapse Rate (%)')
ax.set_title('12-Month Relapse Rates by Treatment')
plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
for bar in bars:
    ax.annotate(f'{bar.get_height():.0f}%',
                (bar.get_x() + bar.get_width()/2, bar.get_height()),
                textcoords="offset points", xytext=(0, 3), ha='center', fontsize=9)

# Plot 2: Remission rates bar chart
ax2 = axes[1]
ax2.set_facecolor('white')
bars2 = ax2.bar(treatments_remission, remission_pct, color=bar_colors_remission)
ax2.set_ylim(0, 100)
ax2.set_ylabel('Remission Rate (%)')
ax2.set_title('12-Month Remission Rates by Treatment')
plt.setp(ax2.get_xticklabels(), rotation=45, ha='right')
for bar in bars2:
    ax2.annotate(f'{bar.get_height():.0f}%',
                 (bar.get_x() + bar.get_width()/2, bar.get_height()),
                 textcoords="offset points", xytext=(0, 3), ha='center', fontsize=9)

plt.tight_layout()

plt.savefig('plots/12-month-comparison.png', bbox_inches='tight', dpi=300)
plt.close()
# plt.show()
