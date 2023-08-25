import { useEffect, useState } from "react";

// Based on https://stackoverflow.com/questions/42615556/how-to-preload-images-in-react-js
// Might not be 100% perfect but gets the job done.

function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(src);
    };
    img.onabort = () => {
      reject(src);
    };
    img.src = src;
  });
}

export function useImagePreloader(imageList: string[]) {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    async function effect() {
      if (isCancelled) {
        return;
      }

      const imagesPromiseList: Promise<any>[] = [];
      imageList.forEach((img) => imagesPromiseList.push(preloadImage(img)));
      await Promise.all(imagesPromiseList);

      if (isCancelled) {
        return;
      }

      setImagesPreloaded(true);
    }

    effect();

    return () => {
      isCancelled = true;
    };
  }, [imageList]);

  return { imagesPreloaded };
}
