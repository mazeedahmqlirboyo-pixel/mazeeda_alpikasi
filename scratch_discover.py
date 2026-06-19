import urllib.request
import json

url = "https://avvitujfdhjqzcuhfpex.supabase.co/rest/v1/"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res = response.read().decode("utf-8")
        data = json.loads(res)
        print("API Schema title:", data.get("info", {}).get("title"))
        definitions = data.get("definitions", {})
        print("Found tables:")
        for table in sorted(definitions.keys()):
            cols = list(definitions[table].get("properties", {}).keys())
            print(f"- {table}: {cols}")
except Exception as e:
    print("Error querying database:")
    if hasattr(e, "read"):
        print(e.read().decode("utf-8"))
    else:
        print(str(e))
