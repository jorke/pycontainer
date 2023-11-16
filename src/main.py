import os

def main():
    greeting = os.environ['greeting'] if 'greeting' in os.environ is not None else 'world'
    print(f"Hello {greeting}!")

if __name__ == "__main__":
    main()