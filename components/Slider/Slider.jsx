"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shaders.js";
import { slides } from "./slides.js";

const Slider = () => {
  const canvasRef = useRef(null);
  const sliderRef = useRef(null);

  // 狀態變數
  let currentSlideIndex = 0;
  let isTransitioning = false;
  let slideTextures = [];
  let shaderMaterial, renderer;

  // --- 初始化 WebGL Renderer ---
  const initializeRenderer = async () => {
    const container = sliderRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Shader 設定
    shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uProgress: { value: 0.0 }, // 控制切換進度 0 -> 1
        uResolution: { value: new THREE.Vector2(width, height) },
        uTexture1Size: { value: new THREE.Vector2(1, 1) },
        uTexture2Size: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

    // 預載所有圖片
    const loader = new THREE.TextureLoader();
    const loadPromises = slides.map((slide) => {
      return new Promise((resolve) => {
        loader.load(slide.image, (texture) => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          // 儲存原始圖片尺寸以供 Shader 計算 Cover 效果
          texture.userData = {
            size: new THREE.Vector2(texture.image.width, texture.image.height),
          };
          resolve(texture);
        });
      });
    });

    slideTextures = await Promise.all(loadPromises);

    // 設定初始圖片
    if (slideTextures.length > 0) {
      shaderMaterial.uniforms.uTexture1.value = slideTextures[0];
      shaderMaterial.uniforms.uTexture2.value =
        slideTextures[1] || slideTextures[0];
      shaderMaterial.uniforms.uTexture1Size.value =
        slideTextures[0].userData.size;
      shaderMaterial.uniforms.uTexture2Size.value = (
        slideTextures[1] || slideTextures[0]
      ).userData.size;
    }

    // 動畫迴圈
    const render = () => {
      if (!sliderRef.current) return;
      requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();
  };

  // --- 處理幻燈片切換 ---
  const handleSlideChange = () => {
    if (isTransitioning || slideTextures.length === 0) return;

    isTransitioning = true;
    const nextIndex = (currentSlideIndex + 1) % slides.length;

    // 設定 Shader Uniforms：當前圖 vs 下一張圖
    shaderMaterial.uniforms.uTexture1.value = slideTextures[currentSlideIndex];
    shaderMaterial.uniforms.uTexture2.value = slideTextures[nextIndex];
    shaderMaterial.uniforms.uTexture1Size.value =
      slideTextures[currentSlideIndex].userData.size;
    shaderMaterial.uniforms.uTexture2Size.value =
      slideTextures[nextIndex].userData.size;

    // 使用 GSAP 動畫化 uProgress (0 -> 1) 觸發轉場特效
    gsap.fromTo(
      shaderMaterial.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 2.5, // 轉場時間
        ease: "power2.inOut",
        onComplete: () => {
          // 動畫結束後，重置狀態
          isTransitioning = false;
          currentSlideIndex = nextIndex;

          // 將 shader 重置為顯示「下一張圖」（它現在變成了當前圖）
          shaderMaterial.uniforms.uProgress.value = 0;
          shaderMaterial.uniforms.uTexture1.value = slideTextures[nextIndex];
          shaderMaterial.uniforms.uTexture1Size.value =
            slideTextures[nextIndex].userData.size;
        },
      }
    );
  };

  // --- 處理視窗大小變動 ---
  const handleResize = () => {
    if (!sliderRef.current || !renderer || !shaderMaterial) return;
    const container = sliderRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    shaderMaterial.uniforms.uResolution.value.set(width, height);
  };

  useEffect(() => {
    let interval;

    const init = async () => {
      await initializeRenderer();
      interval = setInterval(handleSlideChange, 5000); // 5秒自動切換
      window.addEventListener("resize", handleResize);
    };

    init();

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    // RWD 設定：手機版高度 50vh (最少 500px)，桌機版固定 700px
    <div
      ref={sliderRef}
      className="relative w-full h-[50vh] min-h-[500px] lg:h-[700px] overflow-hidden bg-black"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default Slider;
