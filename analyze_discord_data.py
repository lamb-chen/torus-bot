# analyze_discord_data.py
import json
import pandas as pd
import plotly.express as px
import plotly.io as pio

def main():
    # 1. Load JSON data
    with open('./messages.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert to DataFrame
    df = pd.json_normalize(data)
    print("Data loaded:", df.shape)

    # 2. Basic cleaning/prep
    # Make sure timestamps are datetime
    df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')
    # Drop rows without messageId or content if needed
    df.dropna(subset=['messageId', 'content'], inplace=True)

    # 3. Metrics
    total_messages = len(df)
    print("Total messages:", total_messages)

    # Example: messages by user
    messages_per_user = (
        df.groupby('userId')['messageId']
        .count()
        .reset_index(name='message_count')
        .sort_values(by='message_count', ascending=False)
    )

    # 4. Visualizations
    # Example: Bar chart of top 10 users by message count
    top_10_users = messages_per_user.head(10)
    fig_bar = px.bar(
        top_10_users,
        x='userId',
        y='message_count',
        title='Top 10 Users by Message Count'
    )
    # Show figure in a browser or save as file
    fig_bar.write_image('./top_users_bar.png')
    print("Saved bar chart: ./top_users_bar.png")

    # Example: messages over time (by date)
    df['date'] = df['createdAt'].dt.date
    messages_by_date = (
        df.groupby('date')['messageId']
        .count()
        .reset_index(name='message_count')
    )
    fig_line = px.line(messages_by_date, x='date', y='message_count', title='Messages Over Time')
    fig_line.write_image('./messages_over_time.png')
    print("Saved line chart: ./messages_over_time.png")

    # 5. Output summary CSVs or Excel
    messages_per_user.to_csv('./messages_per_user.csv', index=False)
    print("Saved CSV: ./messages_per_user.csv")

    print("Analysis complete.")

if __name__ == "__main__":
    main()
