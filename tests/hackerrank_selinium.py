from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

def get_hackerrank_stats(username):
    # Construct the profile URL
    url = f"https://www.hackerrank.com/{username}"
    
    # Initialize Chrome driver (update path to your chromedriver)
    service = Service("C:\CromeDriver\chromedriver.exe")  # Replace with actual path
    driver = webdriver.Chrome(service=service)
    
    try:
        # Navigate to the profile page
        driver.get(url)
        
        # Wait for a stats container (adjust selector based on page inspection)
        stats_container = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".profile-stats"))
        )
        
        # Extract statistics (adjust selectors based on actual HTML)
        total_solved = stats_container.find_element(By.CSS_SELECTOR, ".total-solved").text
        easy_solved = stats_container.find_element(By.CSS_SELECTOR, ".easy-solved").text
        medium_solved = stats_container.find_element(By.CSS_SELECTOR, ".medium-solved").text
        hard_solved = stats_container.find_element(By.CSS_SELECTOR, ".hard-solved").text
        acceptance_rate = stats_container.find_element(By.CSS_SELECTOR, ".acceptance-rate").text
        
        # Print statistics
        print(f"Total Solved: {total_solved}")
        print(f"Easy: {easy_solved}/876")
        print(f"Medium: {medium_solved}/1840")
        print(f"Hard: {hard_solved}/833")
        print(f"Acceptance Rate: {acceptance_rate}%")
    except Exception as e:
        print(f"Failed to retrieve statistics: {str(e)}")
        print("Possible causes: Invalid username, stats not public, or incorrect selectors.")
        print("Inspect the page HTML at https://www.hackerrank.com/{username} to update selectors.")
    finally:
        driver.quit()

# Example usage
if __name__ == "__main__":
    test_usernames = ["vukkembhuvan"]
    for username in test_usernames:
        print(f"\nTesting {username}:")
        get_hackerrank_stats(username)