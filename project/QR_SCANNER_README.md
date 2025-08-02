# QR Scanner & 3D Viewer Feature

## Overview
The QR Scanner & 3D Viewer is an interactive feature that allows children to scan QR codes and upload images to discover 3D content, animals, and educational objects.

## Features

### 🎯 QR Code Scanning
- Real-time QR code scanning using device camera
- Instant 3D content display when QR codes are detected
- Support for various content types (animals, objects, letters, numbers)

### 📸 Image Upload
- Upload images for object detection simulation
- Automatic content recognition and 3D display
- Educational content with facts and descriptions

### 🎮 3D Content Viewer
- Interactive 3D models (represented as emojis)
- Rotation controls (X, Y, Z axes)
- Scaling controls (zoom in/out)
- Reset view functionality
- Audio integration for sound effects

### 🎵 Audio Integration
- Sound effects for each content type
- Audio button for accessibility
- Educational narration

## How to Access

### From Child Dashboard
1. Navigate to the Child Dashboard
2. Find the "QR Scanner & 3D Viewer" learning hub
3. Click on it to open the QR Scanner modal

### From AR Zone
1. Navigate to the AR Zone (`/ar-zone/:childId`)
2. Click on "QR Scanner & 3D Viewer" button
3. The QR Scanner will open as a modal

## How to Use

### Scanning QR Codes
1. Click "Start QR Scanner" button
2. Allow camera permissions when prompted
3. Point camera at a QR code
4. Watch as 3D content appears automatically

### Uploading Images
1. Click "Upload Image" button
2. Select an image file from your device
3. Wait for processing (simulated)
4. View the detected 3D content

### Interacting with 3D Content
- **Rotate**: Use the rotation buttons to turn the model
- **Scale**: Use zoom buttons to make the model larger/smaller
- **Reset**: Click reset to return to original view
- **Audio**: Click the speaker button to play associated sounds
- **Facts**: Read educational facts about the content

## Available Content

### Animals
- **Lion** 🦁 - King of the jungle with facts about prides and hunting
- **Elephant** 🐘 - Gentle giants with amazing memories
- **Monkey** 🐒 - Playful and clever tree-dwellers
- **Frog** 🐸 - Amazing jumpers that start as tadpoles

### Objects
- **Apple** 🍎 - Healthy fruit that starts with letter A
- **House** 🏠 - Cozy homes where families live together

### Educational
- **Letter A** 🅰️ - Learning the alphabet
- **Number 1** 1️⃣ - Counting and numbers

## Testing

### QR Codes for Testing
1. Open `public/qr-codes.html` in your browser
2. This page displays all available QR codes
3. Use these codes to test the scanner functionality

### Test QR Codes Include:
- lion
- elephant
- monkey
- frog
- apple
- house
- letter-a
- number-1

## Technical Details

### Dependencies
- `html5-qrcode` - QR code scanning library
- `framer-motion` - Animations and transitions
- `lucide-react` - Icons
- React hooks for state management

### File Structure
```
src/
├── components/
│   └── QRScanner.tsx          # Main QR Scanner component
├── pages/
│   ├── ChildDashboard.tsx     # Dashboard with QR Scanner hub
│   └── ARZone.tsx            # AR Zone with QR Scanner access
└── public/
    └── qr-codes.html         # Test QR codes page
```

### Content Database
The QR Scanner uses an in-memory content database that maps QR data to:
- 3D model representations (emojis)
- Educational descriptions
- Fun facts
- Sound file URLs

### Sound Files
Sound effects are located in `public/bushes/`:
- `jungle.mp3` - General animal sounds
- `monkey-walk.mp3` - Monkey sounds
- `frog-small.mp3` - Frog sounds

## Customization

### Adding New Content
1. Add new entries to the `contentDatabase` in `QRScanner.tsx`
2. Create corresponding QR codes using the test page
3. Add sound files if needed

### Modifying 3D Models
- Currently uses emojis as 3D representations
- Can be extended to use actual 3D models (Three.js, etc.)

### Styling
- Uses Tailwind CSS for styling
- Responsive design for mobile devices
- Animated transitions with Framer Motion

## Troubleshooting

### Camera Not Working
- Ensure camera permissions are granted
- Check if device supports camera access
- Try refreshing the page

### QR Codes Not Scanning
- Ensure good lighting
- Hold camera steady
- Check if QR code is clear and readable

### Content Not Displaying
- Verify QR code contains valid content ID
- Check browser console for errors
- Ensure all dependencies are installed

## Future Enhancements

### Planned Features
- Real 3D models instead of emojis
- More sophisticated object detection
- Cloud-based content database
- Progress tracking for scanned content
- Social sharing of discoveries

### Technical Improvements
- WebGL 3D rendering
- Machine learning object detection
- Offline content caching
- Performance optimizations

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all dependencies are properly installed
3. Test with the provided QR codes first
4. Ensure device supports required features (camera, etc.)

---

**Note**: This feature is designed for educational purposes and provides a fun, interactive way for children to learn about animals, objects, and educational content through technology. 