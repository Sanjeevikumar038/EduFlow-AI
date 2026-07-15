import os
import re

emoji_map = {
    '📊': '<i className="fa-solid fa-chart-pie"></i>',
    '📱': '<i className="fa-solid fa-mobile-screen"></i>',
    '✍️': '<i className="fa-solid fa-pen-to-square"></i>',
    '📅': '<i className="fa-solid fa-calendar-day"></i>',
    '📈': '<i className="fa-solid fa-chart-line"></i>',
    '🎓': '<i className="fa-solid fa-user-graduate"></i>',
    '📋': '<i className="fa-solid fa-clipboard-list"></i>',
    '🚀': '<i className="fa-solid fa-rocket"></i>',
    '⚡': '<i className="fa-solid fa-bolt"></i>',
    '🌐': '<i className="fa-solid fa-globe"></i>',
    '🌙': '<i className="fa-solid fa-moon"></i>',
    '☀️': '<i className="fa-solid fa-sun"></i>',
    '🔔': '<i className="fa-solid fa-bell"></i>',
    '✓': '<i className="fa-solid fa-check"></i>',
    '✕': '<i className="fa-solid fa-times"></i>',
    '🏝️': '<i className="fa-solid fa-umbrella-beach"></i>',
    '📍': '<i className="fa-solid fa-location-dot"></i>',
    '🚪': '<i className="fa-solid fa-right-from-bracket"></i>',
    '▼': '<i className="fa-solid fa-chevron-down"></i>',
    '🎙️': '<i className="fa-solid fa-microphone"></i>',
    '⏳': '<i className="fa-solid fa-hourglass-half"></i>',
    '🔄': '<i className="fa-solid fa-spinner fa-spin"></i>',
    '🏁': '<i className="fa-solid fa-flag-checkered"></i>',
    '➔': '<i className="fa-solid fa-arrow-right"></i>',
    '⬅️': '<i className="fa-solid fa-arrow-left"></i>',
    '📚': '<i className="fa-solid fa-book"></i>',
    '💻': '<i className="fa-solid fa-laptop-code"></i>',
    '🏆': '<i className="fa-solid fa-trophy"></i>',
    '🔥': '<i className="fa-solid fa-fire"></i>',
    '🎯': '<i className="fa-solid fa-bullseye"></i>',
    '✅': '<i className="fa-solid fa-circle-check"></i>',
    '👨‍💻': '<i className="fa-solid fa-user-tie"></i>',
    '⚙️': '<i className="fa-solid fa-gear"></i>',
    '👥': '<i className="fa-solid fa-users"></i>',
    '🛑': '<i className="fa-solid fa-ban"></i>',
    '📝': '<i className="fa-solid fa-file-signature"></i>',
    '⭐': '<i className="fa-solid fa-star"></i>',
    '👋': '<i className="fa-solid fa-hand-wave"></i>', // fa-hand-sparkles or something, let's use fa-hand-wave or drop
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # 1. Replace cases where emoji is inside a string value assigned to `icon=` property: icon: "📊" -> icon: <i ...></i>
    for emoji, icon in emoji_map.items():
        content = re.sub(rf'icon:\s*"{emoji}"', f'icon: {icon}', content)

    # 2. Replace cases where emoji is the entire string inside JSX: >📊< -> ><i ...></i><
    for emoji, icon in emoji_map.items():
        content = re.sub(rf'>\s*{emoji}\s*<', f'>{icon}<', content)

    # 3. Replace cases where emoji is with text: <div>📊 Analytics</div> -> <div><i ...></i> Analytics</div>
    # Needs a generic replacement. Let's just replace the raw emoji with the icon, but wait, inside JSX strings like "🌙 Dark Mode", it's tricky.
    # We will do a generic replacement if it's NOT inside a quoted string.
    # Actually, replacing all emojis with `<i className="..."></i>` might break `placeholder="🔍 Search"` or ternary `{isDark ? "🌙" : "☀️"}`.
    # So let's write out matches to inspect first.
    pass

def scan():
    for root, dirs, files in os.walk(r'c:\Users\sanje\Downloads\PROJECTS\EduFlow\eduflow-frontend\src'):
        for file in files:
            if file.endswith('.jsx'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                for emoji in emoji_map.keys():
                    if emoji in content:
                        print(f"Found {emoji} in {path}")

scan()
