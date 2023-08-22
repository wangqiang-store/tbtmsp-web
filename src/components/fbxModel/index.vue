<template>
  <!-- 3D模型 -->
  <div class="container_three">
    <div
      id="model_box"
      ref="model_box"
      style="height:100%"
    ></div>
  </div>
</template>

<script>
// 导入 threejs模块
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
export default defineComponent({
  setup() {
    let model_box = ref();
    let mesh;
    let plane;
    let camera;
    let scene;
    let renderer;
    let controls;
    let INTERSECTED;
    let mousedown = new Three.Vector3();
    let mousemove = new Three.Vector3();
    // 创建场景
    const createScene = () => {
      scene = new Three.Scene();
    };
    // 加载FbX模型
    const loadOBJ = () => {
      // model
      const loader = new FBXLoader();
      // 设置当前加载的纹理
      loader.load('models/fbx/Wanda.fbx', loadedMesh => {
        mesh = loadedMesh
        mesh.rotation.x = -Math.PI / 2;
        // 添加到场景
        scene.add(mesh)

      }, (xhr) => {
        // 加载进度
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100
          // console.log(Math.round(percentComplete, 2) + '%')
        }
      })
      // 地板
      plane = new Three.Mesh(
        new Three.PlaneBufferGeometry(2000, 2000),
        new Three.MeshPhongMaterial({ color: 0xc2c4c7, depthWrite: false })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      scene.add(plane);
    };
    // 创建光源
    const createLight = () => {
      // 环境光
      const ambientLight = new Three.AmbientLight(0xffffff, 0.3); // 创建环境光
      scene.add(ambientLight); // 将环境光添加到场景
      const spotLight = new Three.SpotLight('#ffffff', 0.7); // 创建聚光灯 #ffffff
      spotLight.position.set(1600, 1660, 100);
      spotLight.castShadow = true;
      scene.add(spotLight);
    };
    // 创建相机
    const createCamera = () => {
      const width = model_box.value.clientWidth; // 窗口宽度
      const height = model_box.value.clientHeight; // 窗口高度
      const k = width / height; // 窗口宽高比
      camera = new Three.PerspectiveCamera(75, k, 0.1, 1000);
      camera.position.set(400, 400, 50);
      camera.lookAt(scene.position);
      scene.add(camera);
    };
    // 创建渲染器
    const createRender = () => {
      renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(model_box.value.clientWidth, model_box.value.clientHeight);
      renderer.shadowMap.enabled = true; // 显示阴影
      renderer.shadowMap.type = Three.PCFSoftShadowMap;
      renderer.setClearColor('#e8e8e8'); // 设置背景颜色
      model_box.value.appendChild(renderer.domElement);
    };
    const render = () => {
      if (mesh) {
        // mesh.rotation.y += 0.008
        // mesh.rotation.z += 0.005
      }
      renderer && renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    // 创建控件对象
    const createControls = () => {
      // eslint-disable-next-line no-new
      controls = new OrbitControls(camera, renderer.domElement);
    }; // 窗口自适应
    const resize = () => {
      window.addEventListener('resize', () => {
        // 初始化摄像机
        camera && (camera.aspect = model_box.value.clientWidth / model_box.value.clientHeight);
        camera && camera.updateProjectionMatrix(); // 初始化渲染器尺寸
        renderer && renderer.setSize(model_box.value.clientWidth, model_box.value.clientHeight);
      });
    };
    // 用户交互
    let interfaceObj = {
      // 选中模型
      selectObject: (event) => {
        event.preventDefault();
        if (event.button != 0) return;

        // const mousedown = new Three.Vector3();
        mousedown.x = (event.clientX / model_box.value.clientWidth) * 2 - 1; //window.innerWidth
        mousedown.y = -(event.clientY / model_box.value.clientHeight) * 2 + 1; //window.innerHeight

        const raycaster = new Three.Raycaster();
        raycaster.setFromCamera(mousedown, camera);

        const intersected = raycaster.intersectObjects(
          scene.children,
          true
        );
        // console.log(intersected)
        if (intersected.length) {
          const found = intersected[0];
          // const faceIndex = found.faceIndex;
          // const geometry = found.object.geometry;
          // const id = ifcLoader.ifcManager.getExpressId(geometry, faceIndex);
          found.object.material.color.set(0xff0000);
          // const modelID = found.object.modelID;
          // ifcLoader.ifcManager.createSubset( { modelID, ids: [ id ], scene, removePrevious: true, material: highlightMaterial } );
          // const props = ifcLoader.ifcManager.getItemProperties(modelID, id, true);
          // this.renderer.render( this.scene, this.camera );
        }
      },
      // 鼠标 移动
      pointermove: (event) => {
        event.preventDefault();
        // if (event.button != 0) return;

        // const mousemove = new Three.Vector3();
        mousemove.x = (event.clientX / model_box.value.clientWidth) * 2 - 1;
        mousemove.y = -(event.clientY / model_box.value.clientHeight) * 2 + 1;

        const raycaster = new Three.Raycaster();
        raycaster.setFromCamera(mousemove, camera);

        const intersected = raycaster.intersectObjects(
          scene.children,
          true
        );

        if (intersected.length > 0) {
          if (INTERSECTED != intersected[0].object) {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersected[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);
          }
        } else {
          if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
          INTERSECTED = null;
        }
      }
    }
    // 销毁
    const removeCube = () => {
      var allChildren = scene.children;
      if (allChildren.length > 0) {
        renderer.setSize(0, 0)
        allChildren.forEach(item => {
          scene.remove(item);
        })
      }
      scene.traverse((child) => {
        if (child.material) {
          child.material.dispose();
        }
        if (child.geometry) {
          child.geometry.dispose();
        }
        child = null;
      });
      renderer.forceContextLoss();
      renderer.dispose();
      scene.clear();
      scene = null;
      camera = null;
      controls = null;
      renderer.domElement = null;
      renderer = null;
    }
    // 初始化
    const init = () => {
      createScene(); // 创建场景    
      loadOBJ(); // 加载OBJ模型   
      createCamera(); // 创建相机
      createLight(); // 创建光源
      createRender(); // 创建渲染器
      createControls(); // 创建控件对象
      render(); // 渲染
      resize(); // 自适应
    };
    onMounted(() => {
      init()
      window.addEventListener('pointerdown', interfaceObj.selectObject);
      window.addEventListener("pointermove", interfaceObj.pointermove);
    })
    onUnmounted(() => {
      removeCube();
      window.removeEventListener('pointerdown', interfaceObj.selectObject);
      window.removeEventListener('pointermove', interfaceObj.pointermove);
    })
    return {
      model_box
    }
  }
})
</script>

<style lang="scss"  scoped>
.container_three {
  height: calc(100vh - 80px);
  .model_box {
    width: 100%;
  }
}
</style>