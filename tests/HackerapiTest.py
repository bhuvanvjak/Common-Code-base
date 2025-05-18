import requests

def get_hackerrank_stats(username):
    # Validate username
    if not username or not isinstance(username, str):
        print(f"Invalid username: {username}")
        return

    # Construct the API URL
    url = f"https://www.hackerrank.com/rest/contests/master/hackers/{username}/profile"
    
    try:
        # Send a GET request
        response = requests.get(url, timeout=10)
        
        # Print debugging info
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text[:500]}...")  # Limit output length
        
        # Check if request was successful
        if response.status_code == 200:
            data = response.json()
            print("JSON Response:", data)
            
            # Extract statistics (adjust field names based on actual JSON)
            total_solved = data.get('totalSolved', 0)
            easy_solved = data.get('easySolved', 0)
            medium_solved = data.get('mediumSolved', 0)
            hard_solved = data.get('hardSolved', 0)
            acceptance_rate = data.get('acceptanceRate', 0)
            
            # Print statistics
            print(f"Total Solved: {total_solved}")
            print(f"Easy: {easy_solved}/876")
            print(f"Medium: {medium_solved}/1840")
            print(f"Hard: {hard_solved}/833")
            print(f"Acceptance Rate: {acceptance_rate}%")
        else:
            print(f"Failed to retrieve data. Status code: {response.status_code}")
            if response.status_code == 404:
                print("Possible causes: Invalid username or endpoint not found.")
            elif response.status_code == 403:
                print("Possible causes: Authentication required or access forbidden.")
            elif response.status_code == 429:
                print("Possible causes: Rate limit exceeded.")
    except requests.RequestException as e:
        print(f"Request failed: {str(e)}")
        print("Possible causes: Network error, invalid URL, or server issue.")

# Test multiple usernames
if __name__ == "__main__":
    test_usernames = ["vukkembhuvan"]
    for username in test_usernames:
        print(f"\nTesting {username}:")
        get_hackerrank_stats(username)