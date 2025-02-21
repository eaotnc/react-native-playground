import YStack from "@components/layout/YStack";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import ViewShot from "react-native-view-shot";

const MAX_ASPECT_RATIO = 1.33;
const MIN_ASPECT_RATIO = 0.75;

interface WaterMarkPhotoProps {
  src: string;
  text: string;
  typeText: string;
  sharableURICallback: (uri: string) => void;
  generateSharableImage: boolean;
}

const styles = StyleSheet.create({
  poweredBy: {
    color: "gray",
    fontSize: 8,
    fontStyle: "italic",
  },
  waterMarkContainer: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  viewShotContainer: {
    paddingHorizontal: 6,
    paddingTop: 6,
    margin: 0,
    backgroundColor: "white",
  },
  overallContainer: {
    position: "absolute",
    padding: 0,
    margin: 0,
    opacity: 0,
  },
  image: {
    borderRadius: 4,
  },
  caption: {
    color: "black",
    fontSize: 10,
  },
});

const WatermarkPhoto = ({
  src,
  text,
  typeText,
  sharableURICallback,
  generateSharableImage,
}: WaterMarkPhotoProps) => {
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
    aspectRatio: 0,
  });
  const captureRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (!generateSharableImage) return;
    Image.getSize(src, (width, height) => {
      const screenWidth = Dimensions.get("window").width;
      const scaleFactor = width / screenWidth;
      const imageHeight = height / scaleFactor;
      const imageWidth = screenWidth;
      const aspectRatio = imageWidth / imageHeight;
      if (aspectRatio > MAX_ASPECT_RATIO) {
        setImageSize({
          width: imageWidth,
          height: imageHeight,
          aspectRatio: MAX_ASPECT_RATIO,
        });
        return;
      }
      if (aspectRatio < MIN_ASPECT_RATIO) {
        setImageSize({
          width: imageWidth,
          height: imageHeight,
          aspectRatio: MIN_ASPECT_RATIO,
        });
        return;
      }
      setImageSize({ width: imageWidth, height: imageHeight, aspectRatio });
    });
  }, [src, Dimensions]);

  const capture = useCallback(async () => {
    if (!generateSharableImage) return;
    if (!src) return "";
    try {
      sharableURICallback("");
      const uri = await captureRef.current.capture();
      if (uri) sharableURICallback(uri);
    } catch (error) {
      // handle error...
    }
  }, [src]);

  // prevent rendering if the image is not ready or if the image is not provided
  if (!src) return null;
  if (!imageSize.width) return null;
  if (!imageSize.height) return null;

  if (!generateSharableImage) return null;

  return (
    <View style={styles.overallContainer} pointerEvents="none">
      <ViewShot
        ref={captureRef}
        options={{ format: "jpg", quality: 1 }}
        style={styles.viewShotContainer}
      >
        <YStack
          style={{
            padding: 0,
            margin: 0,
          }}
        >
          <Image
            source={{ uri: src }}
            style={[
              styles.image,
              {
                width: imageSize.width,
                aspectRatio: imageSize.aspectRatio,
              },
            ]}
            onLoad={capture}
          />

          <YStack
            style={styles.waterMarkContainer}
            justifyContent="space-between"
            alignItems="center"
            space={6}
          >
            <Text style={styles.caption}>
              {typeText} | <Text style={{ fontWeight: "bold" }}>{text}</Text>
            </Text>
            <Text style={styles.poweredBy}>
              Powered By{" "}
              <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
                DrivnBye
              </Text>
            </Text>
          </YStack>
        </YStack>
      </ViewShot>
    </View>
  );
};

export default WatermarkPhoto;
