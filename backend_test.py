#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime

class NyxenAPITester:
    def __init__(self, base_url="https://completion-engine-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.conversation_id = None
        self.character_id = None
        self.setting_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                expected_keys = ["message", "developer"]
                success = all(key in data for key in expected_keys)
                if success and "Nyxen" in data.get("message", ""):
                    return self.log_test("API Root", True)
                else:
                    return self.log_test("API Root", False, f"Unexpected response: {data}")
            else:
                return self.log_test("API Root", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("API Root", False, str(e))

    def test_create_conversation(self):
        """Test conversation creation"""
        try:
            payload = {
                "title": "Test Story Session",
                "genre": "fantasy",
                "mode": "deep"
            }
            response = requests.post(f"{self.api_url}/conversations", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["id", "title", "genre", "mode", "created_at", "updated_at"]
                success = all(field in data for field in required_fields)
                if success:
                    self.conversation_id = data["id"]
                    return self.log_test("Create Conversation", True)
                else:
                    return self.log_test("Create Conversation", False, f"Missing fields in response: {data}")
            else:
                return self.log_test("Create Conversation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Create Conversation", False, str(e))

    def test_get_conversations(self):
        """Test getting conversations list"""
        try:
            response = requests.get(f"{self.api_url}/conversations", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
                if success and len(data) > 0:
                    # Check if our created conversation is in the list
                    conv_found = any(conv.get("id") == self.conversation_id for conv in data)
                    success = conv_found
                return self.log_test("Get Conversations", success, "Created conversation not found in list" if not success else "")
            else:
                return self.log_test("Get Conversations", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Conversations", False, str(e))

    def test_chat_functionality(self):
        """Test chat endpoint with Groq API integration"""
        try:
            payload = {
                "conversation_id": self.conversation_id,
                "message": "Tell me a short fantasy story about a magical forest.",
                "genre": "fantasy",
                "mode": "fast"
            }
            response = requests.post(f"{self.api_url}/chat", json=payload, timeout=60)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["conversation_id", "message"]
                success = all(field in data for field in required_fields)
                if success:
                    message = data.get("message", {})
                    success = (message.get("role") == "assistant" and 
                             len(message.get("content", "")) > 50)  # Ensure substantial response
                    if success:
                        print(f"   📝 AI Response length: {len(message.get('content', ''))} characters")
                        return self.log_test("Chat Functionality (Groq API)", True)
                    else:
                        return self.log_test("Chat Functionality (Groq API)", False, f"Invalid AI response: {message}")
                else:
                    return self.log_test("Chat Functionality (Groq API)", False, f"Missing fields: {data}")
            else:
                return self.log_test("Chat Functionality (Groq API)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Chat Functionality (Groq API)", False, str(e))

    def test_story_generation(self):
        """Test story generation endpoint"""
        try:
            payload = {
                "prompt": "A brave knight discovers a hidden dragon's lair",
                "genre": "fantasy",
                "mode": "fast"
            }
            response = requests.post(f"{self.api_url}/story/generate", json=payload, timeout=60)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["story", "genre", "mode"]
                success = all(field in data for field in required_fields)
                if success:
                    story_length = len(data.get("story", ""))
                    success = story_length > 100  # Ensure substantial story
                    if success:
                        print(f"   📖 Generated story length: {story_length} characters")
                        return self.log_test("Story Generation", True)
                    else:
                        return self.log_test("Story Generation", False, f"Story too short: {story_length} chars")
                else:
                    return self.log_test("Story Generation", False, f"Missing fields: {data}")
            else:
                return self.log_test("Story Generation", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Story Generation", False, str(e))

    def test_create_character(self):
        """Test character creation (Story Bible)"""
        try:
            payload = {
                "name": "Aria Shadowbane",
                "description": "A skilled elven ranger with a mysterious past",
                "traits": ["brave", "mysterious", "skilled archer"],
                "backstory": "Born in the ancient forests, trained by the shadow guild",
                "relationships": {"mentor": "Master Thorne"},
                "speech_patterns": "Speaks in measured, thoughtful tones",
                "emotional_state": "determined"
            }
            response = requests.post(f"{self.api_url}/characters", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["id", "name", "description", "traits", "backstory"]
                success = all(field in data for field in required_fields)
                if success:
                    self.character_id = data["id"]
                    success = (data["name"] == payload["name"] and 
                             len(data["traits"]) == len(payload["traits"]))
                    return self.log_test("Create Character", success)
                else:
                    return self.log_test("Create Character", False, f"Missing fields: {data}")
            else:
                return self.log_test("Create Character", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Create Character", False, str(e))

    def test_get_characters(self):
        """Test getting characters list"""
        try:
            response = requests.get(f"{self.api_url}/characters", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
                if success and len(data) > 0:
                    # Check if our created character is in the list
                    char_found = any(char.get("id") == self.character_id for char in data)
                    success = char_found
                return self.log_test("Get Characters", success, "Created character not found" if not success else "")
            else:
                return self.log_test("Get Characters", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Characters", False, str(e))

    def test_update_character(self):
        """Test character update"""
        try:
            payload = {
                "name": "Aria Shadowbane",
                "description": "A skilled elven ranger with a mysterious past - UPDATED",
                "traits": ["brave", "mysterious", "skilled archer", "wise"],
                "backstory": "Born in the ancient forests, trained by the shadow guild - UPDATED",
                "relationships": {"mentor": "Master Thorne", "ally": "Sir Gareth"},
                "speech_patterns": "Speaks in measured, thoughtful tones",
                "emotional_state": "hopeful"
            }
            response = requests.put(f"{self.api_url}/characters/{self.character_id}", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = ("UPDATED" in data.get("description", "") and 
                         len(data.get("traits", [])) == 4)
                return self.log_test("Update Character", success)
            else:
                return self.log_test("Update Character", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Update Character", False, str(e))

    def test_create_story_setting(self):
        """Test story setting creation"""
        try:
            payload = {
                "name": "The Whispering Woods",
                "type": "location",
                "description": "An ancient forest where the trees hold memories of old magic",
                "details": {"climate": "temperate", "danger_level": "moderate"}
            }
            response = requests.post(f"{self.api_url}/story-settings", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["id", "name", "type", "description"]
                success = all(field in data for field in required_fields)
                if success:
                    self.setting_id = data["id"]
                    return self.log_test("Create Story Setting", True)
                else:
                    return self.log_test("Create Story Setting", False, f"Missing fields: {data}")
            else:
                return self.log_test("Create Story Setting", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Create Story Setting", False, str(e))

    def test_get_story_settings(self):
        """Test getting story settings list"""
        try:
            response = requests.get(f"{self.api_url}/story-settings", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
                if success and len(data) > 0:
                    # Check if our created setting is in the list
                    setting_found = any(setting.get("id") == self.setting_id for setting in data)
                    success = setting_found
                return self.log_test("Get Story Settings", success, "Created setting not found" if not success else "")
            else:
                return self.log_test("Get Story Settings", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Story Settings", False, str(e))

    def test_media_gallery(self):
        """Test media gallery endpoint"""
        try:
            response = requests.get(f"{self.api_url}/media", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = isinstance(data, list)
                return self.log_test("Media Gallery", success)
            else:
                return self.log_test("Media Gallery", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Media Gallery", False, str(e))

    def test_image_generation(self):
        """Test image generation (APIFree integration) - Note: This may take time"""
        try:
            payload = {
                "prompt": "A magical forest with glowing mushrooms and ethereal light"
            }
            print("   🎨 Starting image generation (this may take 30-60 seconds)...")
            response = requests.post(f"{self.api_url}/image/generate", json=payload, timeout=120)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_fields = ["id", "url", "prompt"]
                success = all(field in data for field in required_fields)
                if success:
                    print(f"   🖼️ Image generated: {data.get('url', '')[:50]}...")
                    return self.log_test("Image Generation (APIFree)", True)
                else:
                    return self.log_test("Image Generation (APIFree)", False, f"Missing fields: {data}")
            else:
                return self.log_test("Image Generation (APIFree)", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Image Generation (APIFree)", False, str(e))

    def cleanup_test_data(self):
        """Clean up test data"""
        cleanup_success = 0
        cleanup_total = 0
        
        # Delete character
        if self.character_id:
            cleanup_total += 1
            try:
                response = requests.delete(f"{self.api_url}/characters/{self.character_id}", timeout=10)
                if response.status_code == 200:
                    cleanup_success += 1
                    print("🧹 Cleaned up test character")
            except:
                pass
        
        # Delete setting
        if self.setting_id:
            cleanup_total += 1
            try:
                response = requests.delete(f"{self.api_url}/story-settings/{self.setting_id}", timeout=10)
                if response.status_code == 200:
                    cleanup_success += 1
                    print("🧹 Cleaned up test setting")
            except:
                pass
        
        # Delete conversation
        if self.conversation_id:
            cleanup_total += 1
            try:
                response = requests.delete(f"{self.api_url}/conversations/{self.conversation_id}", timeout=10)
                if response.status_code == 200:
                    cleanup_success += 1
                    print("🧹 Cleaned up test conversation")
            except:
                pass
        
        print(f"🧹 Cleanup: {cleanup_success}/{cleanup_total} items cleaned")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Nyxen Backend API Tests")
        print("=" * 50)
        
        # Core API tests
        self.test_api_root()
        
        # Conversation tests
        self.test_create_conversation()
        self.test_get_conversations()
        
        # Chat functionality (Groq API)
        self.test_chat_functionality()
        
        # Story generation
        self.test_story_generation()
        
        # Character CRUD (Story Bible)
        self.test_create_character()
        self.test_get_characters()
        self.test_update_character()
        
        # Story settings CRUD
        self.test_create_story_setting()
        self.test_get_story_settings()
        
        # Media gallery
        self.test_media_gallery()
        
        # Image generation (APIFree) - Optional due to time
        print("\n⚠️  Image generation test may take 30-60 seconds...")
        print("⏭️  Skipping image generation test for automated testing")
        
        # Cleanup
        print("\n🧹 Cleaning up test data...")
        self.cleanup_test_data()
        
        # Results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = NyxenAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())