import urllib.request
import json

url = "https://avvitujfdhjqzcuhfpex.supabase.co/rest/v1/bacaan?select=*"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dml0dWpmZGhqcXpjdWhmcGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTAxMzAsImV4cCI6MjA4NDcyNjEzMH0.FZfYw1Z8yNskYp5uRSlnXaMcRHH5ATlFXWitUwHU7wI"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res = response.read().decode("utf-8")
        data = json.loads(res)
        print("Query success! Found", len(data), "records.")
        for item in data:
            if 'Nas' in item['content'] or 'Nas' in item['title'] or 'نسألك' in item['content'] or 'نَسْئَلُكَ' in item['content']:
                print('--- TITLE:', item['title'])
                print('--- CONTENT:')
                print(item['content'])
                print('-------------------')
except Exception as e:
    print("Error querying database:")
    if hasattr(e, "read"):
        print(e.read().decode("utf-8"))
    else:
        print(str(e))
