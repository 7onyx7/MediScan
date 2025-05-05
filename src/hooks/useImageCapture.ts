import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Custom hook for handling image capture functionality (camera & gallery)
 */
export function useImageCapture() {
  const [image, setImage] = useState<string | null>(null);

  /**
   * Pick an image from the device's photo library
   */
  const pickImage = async (): Promise<string | null> => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'We need access to your photo library to select images.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        return uri;
      }
      
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert('Error', 'Failed to pick image from gallery');
      return null;
    }
  };

  /**
   * Take a photo using the device camera
   */
  const takePhoto = async (): Promise<string | null> => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied', 
          'We need camera access to take photos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImage(uri);
        return uri;
      }
      
      return null;
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert('Error', 'Failed to take photo with camera');
      return null;
    }
  };

  /**
   * Reset the captured image
   */
  const resetImage = () => setImage(null);

  return {
    image,
    pickImage,
    takePhoto,
    resetImage,
    setImage
  };
}