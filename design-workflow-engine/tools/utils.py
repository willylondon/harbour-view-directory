import time

def poll_for_completion(action_name, check_status_fn, interval=5, timeout=300):
    """
    Polls an async API until completion.
    check_status_fn should return 'completed', 'failed', or something else (pending).
    """
    print(f"Starting {action_name}...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        status = check_status_fn()
        if status == 'completed':
            print(f"{action_name} completed successfully.")
            return True
        elif status == 'failed':
            print(f"{action_name} failed.")
            return False
            
        print(f"Status: {status}. Waiting {interval} seconds...")
        time.sleep(interval)
        
    print(f"Timeout of {timeout}s reached for {action_name}.")
    return False
