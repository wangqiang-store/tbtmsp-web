<template>
  <!-- 3D模型 -->
  <div class="container_three">
    <div
      id="model_box"
      ref="model_box"
      style="height:100%"
    ></div>

    <!-- 视图控件 -->
    <div class="treeView">
      <div class="treeView-top">
        <img
          class="d-logo"
          src="@/assets/svg/3D地图.svg"
        >
        <p>3D</p>
        <img
          class="level-logo"
          src="@/assets/svg/楼层.svg"
          @click="onShowFloor"
          title="显示全部楼层"
        >
      </div>
      <div class="treeView-main">
        <ul
          class="floorView"
          ref="floorView"
        >
          <template
            v-for="item of floorParams"
            :key="item.id"
          >
            <li
              class="floor"
              :class="{active :item.show !==undefined && !item.show}"
              @click="onChangeShowFloor(item, item.show ===undefined ? undefined : !item.show)"
              v-if="item.path"
              :title="item.name"
            >
              <img
                class="floorIcon"
                :src="item.path"
              >
            </li>
          </template>
        </ul>

        <img
          class="up-arrow"
          src="@/assets/svg/上箭头.svg"
          @click="onUp"
        >
        <div class="floorViewbox">
          <ul
            class="floorView"
            ref="floorView"
          >
            <template
              v-for="item of floorParams"
              :key="item.id"
            >
              <li
                class="floor"
                :class="{active :item.show !==undefined && !item.show}"
                v-if="item.type === 'floor'"
                @click="onChangeShowFloor(item, item.show ===undefined ? undefined : !item.show)"
              >
                <div v-if="item.name">{{item.name}}</div>
              </li>
            </template>
          </ul>
        </div>
        <img
          class="down-arrow"
          src="@/assets/svg/下箭头.svg"
          @click="onDown"
        >

        <div class="buildingHeight">
          <p style="font-size:14px;font-weight:bold">楼高</p>
          <img
            class="up-arrow"
            src="@/assets/svg/上箭头.svg"
            @click="onChangeHeight(10,'up')"
          >
          <input
            v-model="meshParams.buildingHeight"
            disabled
          />
          <img
            class="down-arrow"
            src="@/assets/svg/下箭头.svg"
            @click="onChangeHeight(-10,'down')"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入 threejs模块
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { computed, defineComponent, inject, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { localRead, localWrite } from "@/api/common/common";
import { sectionResetXYZ } from '@/api/maintenance/buswaySubsection';
import axios from "axios";

export default defineComponent({
  props: {
    markingList: {
      type: Array,
      default: []
    },
    modelType: {
      typeof: String,
      default: "OBJ"
    }
  },
  setup(props) {
    const STORE = useStore();
    let componentName = inject('componentName');
    let model_box = ref();
    let floorView = ref();
    let plane;
    let camera;
    let scene;
    let renderer;
    let controls;
    let gui;
    let group = new Three.Group();
    let INTERSECTED;
    let animationID;//动画ID
    let mousedown = new Three.Vector3();
    let mousemove = new Three.Vector3();

    const positions = [];
    const point = new Three.Vector3();

    const onUpPosition = new Three.Vector2();//鼠标抬起位置
    const onDownPosition = new Three.Vector2();//鼠标按下位置
    const geometry = new Three.OctahedronGeometry(30, 0);//几何体
    // const geometry = localRead('geometrysParams') ? new Three.BoxGeometry(localRead('geometrysParams').width, localRead('geometrysParams').height, localRead('geometrysParams').depth) : new Three.BoxGeometry(20, 20, 20);//几何体
    let boxGeometrys = []; //几何体 列表
    let boxGeometrysHeightRatios = [];//几何体高度比
    let transformControl;
    const ARC_SEGMENTS = 200;
    const splines = {};

    let timer;

    // 模型列表
    let modelList = [
      // {
      //   path: "models/fbx/广州万达_-2F.fbx",
      //   name: "B2"
      // },
      // {
      //   path: "models/fbx/广州万达_-1F.fbx",
      //   name: "B1"
      // },
      // {
      //   path: "models/fbx/广州万达_1F.fbx",
      //   name: "F1"
      // },
      // {
      //   path: "models/fbx/广州万达_2F.fbx",
      //   name: "F2"
      // },
      // {
      //   path: "models/fbx/广州万达_3F.fbx",
      //   name: "F3"
      // },
    ]

    // var clock = new Three.Clock();

    // 连接线 参数
    const connectlineParams = {
      uniform: true,
      tension: 0,
      centripetal: true,
      chordal: true,
    };
    // 模型对象 参数
    let meshParams = reactive({
      animation: false,
      buildingHeight: localRead("buildingHeight") || 250,
    }
    )

    // 几何体 参数
    const geometrysParams = {
      width: localRead('geometrysParams') ? localRead('geometrysParams').width : 20,
      height: localRead('geometrysParams') ? localRead('geometrysParams').height : 20,
      depth: localRead('geometrysParams') ? localRead('geometrysParams').depth : 20,
      isshow: true,
      ismove: false,
    }

    // 视图参数
    const floorParams = ref([
      // {
      //   id: 1,
      //   name: "F3",
      //   show: true,
      //   type: "floor"
      // },
      // {
      //   id: 2,
      //   name: "F2",
      //   show: true,
      //   type: "floor"
      // },
      // {
      //   id: 3,
      //   name: "F1",
      //   show: true,
      //   type: "floor"
      // },
      // {
      //   id: 4,
      //   name: "B1",
      //   show: true,
      //   type: "floor"
      // },
      // {
      //   id: 5,
      //   name: "B2",
      //   show: true,
      //   type: "floor"
      // },
      {
        id: 1,
        name: "旋转",
        path: require("@/assets/svg/旋转.svg"),
        show: true,
        type: "rotate"
      },
      {
        id: 2,
        name: "移动",
        path: require("@/assets/svg/移动.svg"),
        show: true,
        type: "move"
      },
      {
        id: 3,
        name: "复位",
        path: require("@/assets/svg/复位.svg"),
        type: "reset"
      }
    ]);

    // 控制上下箭头滑动距离
    let curIndex = ref(0);

    let elementResizeDetectorMaker = require("element-resize-detector");//导入
    let erd;

    // 创建场景
    const createScene = () => {
      scene = new Three.Scene();
    };
    // 加载模型
    const loadOBJ = () => {
      switch (props.modelType) {
        case "OBJ":
          const mtlLoader = new MTLLoader()
          modelList.forEach((item, index) => {
            mtlLoader.load(item.mtlPath, function (material) {
              let loader = new OBJLoader();
              // 预加载
              material.preload()
              // 设置当前加载的纹理
              loader.setMaterials(material)
              loader.load(item.path, loadedMesh => {
                // console.log('loadedMesh: ', loadedMesh);
                // 创建材质 覆写材质可改变颜色
                // const material = new Three.MeshStandardMaterial({
                //   color: '#F3F3F3',
                //   metalness: 0.4,
                //   roughness: 0.1
                // })
                // 给几何体成员赋该材质
                // loadedMesh.children.forEach(child => {
                //   child.material = material
                //   child.geometry.computeFaceNormals()
                //   child.geometry.computeVertexNormals()
                // })

                item.mesh = loadedMesh
                item.mesh.position.set(0, meshParams.buildingHeight * index, 0)
                item.mesh.rotation.y = 1.5
                group.add(item.mesh);
              }, (xhr) => {
                // 加载进度
                if (xhr.lengthComputable) {
                  const percentComplete = xhr.loaded / xhr.total * 100
                  // console.log(Math.round(percentComplete, 2) + '%')
                }
              })
            })
          })
          break;
        case 'FBX':
          // model
          let loader = new FBXLoader();
          // 加载FBX模型
          modelList.forEach((item, index) => {
            loader.load(item.path,
              loadedMesh => {
                // 获取模型大小
                // const box3 = new Three.Box3()
                // box3.expandByObject(loadedMesh)
                // const v3 = new Three.Vector3()
                // box3.getSize(v3)

                item.mesh = loadedMesh
                // 模型动画
                // item.mesh.mixer = new Three.AnimationMixer(item.mesh);
                // let action = item.mesh.mixer.clipAction(item.mesh.animations[0]);
                // action.play();

                item.mesh.position.set(0, meshParams.buildingHeight * index - 265, 0)
                item.mesh.rotation.x = -Math.PI / 2;
                // item.mesh.position.set(0, 500, 0)
                // item.mesh.rotation.z = 1.5
                // 添加到场景
                // item.mesh.scale.set(0.005, 0.005, 0.005)
                group.add(item.mesh)
              },
              (xhr) => {
                // 加载进度
                if (xhr.lengthComputable) {
                  const percentComplete = xhr.loaded / xhr.total * 100
                  // console.log(Math.round(percentComplete, 2) + '%')
                }
              },
              // 模型加载错误
              (error) => { }
            )
          })
          break
        case "GLTF":
          let GLTFloader = new GLTFLoader();
          modelList.forEach((item, index) => {
            GLTFloader.load(item.path, function (gltf) {
              item.mesh = gltf.scene;
              item.mesh.position.set(0, meshParams.buildingHeight * index - 265, 0)
              // item.mesh.rotation.x = -Math.PI / 2;
              // 模型动画
              // item.mesh.mixer = new Three.AnimationMixer(item.mesh);
              // let action = item.mesh.mixer.clipAction(gltf.animations[1]);
              // action.play();
              group.add(item.mesh)
            }, undefined, function (error) {
              console.error(error);
            });
          })
          break;
        default:
          break;
      }

      // 地板
      plane = new Three.Mesh(
        new Three.PlaneBufferGeometry(3000, 3000),
        new Three.MeshPhongMaterial({ color: 0x21253a, depthWrite: false })//c2c4c7
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -300;
      // plane.receiveShadow = true;
      // scene.add(plane);

      // 网格
      const helper = new Three.GridHelper(3000, 100);
      helper.position.y = -300;
      helper.material.opacity = 0.25;
      helper.material.transparent = true;
      scene.add(helper);

      initBoxGeometrys()
      scene.add(group)
    };

    // 初始化编辑模型块
    let initBoxGeometrys = () => {
      // 设置初始位置
      let initBoxPosition = [];
      for (const item of props.markingList) {
        initBoxPosition.push(// 以250 为基础模型比例 
          new Three.Vector3(item.x, ((item.y + 265) * meshParams.buildingHeight) / 250 - 265, item.z)
        )
      }

      positions.length = 0;
      for (let i = 0; i < initBoxPosition.length; i++) {
        addSplineObject(initBoxPosition[i], props.markingList[i]);
        positions.push(boxGeometrys[i].position);
      }

      const geometry = new Three.BufferGeometry();
      geometry.setAttribute('position', new Three.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3));

      let curve = new Three.CatmullRomCurve3(positions);
      curve.curveType = 'catmullrom';
      curve.mesh = new Three.Line(geometry.clone(), new Three.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
      }));
      curve.mesh.castShadow = true;
      splines.uniform = curve;
      splines.uniform.tension = connectlineParams.tension;
      splines.uniform.mesh.visible = connectlineParams.uniform;

      for (const k in splines) {
        const spline = splines[k];
        group.add(spline.mesh)
      }

      updateSplineOutline();
    }

    // 创建光源
    const createLight = () => {
      // 环境光
      const ambientLight = new Three.AmbientLight(0xffffff, 0.5); // 创建环境光
      scene.add(ambientLight); // 将环境光添加到场景
      const spotLight = new Three.SpotLight('#ffffff', 0.5); // 创建聚光灯
      spotLight.position.set(0, 3200, 0);
      spotLight.castShadow = true;
      scene.add(spotLight);
    };
    // 创建相机
    const createCamera = () => {
      const width = model_box.value.clientWidth; // 窗口宽度
      const height = model_box.value.clientHeight; // 窗口高度
      // const k = width / height; // 窗口宽高比
      // camera = new Three.PerspectiveCamera(85, k, 100, 7200);
      camera = new Three.OrthographicCamera(width / - 0.8, width / 0.8, height / 0.8, height / - 0.8, 1, 7500);
      camera.position.set(1200, 600, -1200);

      camera.lookAt(scene.position);
      scene.add(camera);
    };
    // 创建渲染器
    const createRender = () => {
      renderer = new Three.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(model_box.value.clientWidth, model_box.value.clientHeight);
      renderer.shadowMap.enabled = true; // 显示阴影
      renderer.shadowMap.type = Three.PCFSoftShadowMap;
      renderer.setClearColor('#21253a'); // 设置背景颜色  '#e8e8e8'
      model_box.value.appendChild(renderer.domElement);
    };
    const render = () => {
      // let time = clock.getDelta();
      // if (modelList[0].mesh && modelList[0].mesh.mixer) {
      //   modelList[0].mesh.mixer.update(time);
      // }
      // if (mesh) {
      // mesh.rotation.y += 0.015
      // }
      renderer && renderer.render(scene, camera);
      animationID = requestAnimationFrame(render);
      // cancelAnimationFrame(animationID)
    };
    // 创建控件对象
    const createControls = () => {
      // eslint-disable-next-line no-new
      controls = new OrbitControls(camera, renderer.domElement);

      controls.damping = 0.2;
      // controls.addEventListener('change', render);

      transformControl = new TransformControls(camera, renderer.domElement);
      // transformControl.addEventListener('change', render);
      transformControl.addEventListener('dragging-changed', async function (event) {
        if (!event.value) {
          boxGeometrysHeightRatios = []
          boxGeometrys.forEach((item) => {
            // 重新获取高度比
            boxGeometrysHeightRatios.push((item.position.y + 265) / (meshParams.buildingHeight * (modelList.length - 1)))
          })

          let { sectionBusWay: { sectionBusWayId }, position: { x, y, z } } = transformControl.object;
          // 保存空间位置
          await sectionResetXYZ({
            id: sectionBusWayId,
            x,
            y: (250 * y) / meshParams.buildingHeight,
            z
          })
        }

        if (controls) {
          controls.enabled = !event.value;
        }
      });
      scene.add(transformControl);
      transformControl.addEventListener('objectChange', function (event) {
        updateSplineOutline();
      });
    };

    // Gui 可视化控制
    let initGUI = () => {
      gui = new GUI();
      // 模型对象
      let meshFolder = gui.addFolder("mesh");
      // 控制 旋转动画
      meshFolder.add(meshParams, 'animation').onChange(
        (value) => {
          if (value) {
            function anima() {
              if (group) {
                group.rotation.y += 0.015;
              }

              renderer && renderer.render(scene, camera);
              animationID = requestAnimationFrame(anima);
            }
            anima()
          } else {
            cancelAnimationFrame(animationID)
          }
        }
      )
      // 控制显示 楼层
      modelList.forEach((item) => {
        meshFolder.add(meshParams, item.name).onChange(
          (value) => {
            if (value) {
              group.add(item.mesh)
            } else {
              group.remove(item.mesh)
            }
            scene.add(group)
          }
        )
      })
      // 控制楼高
      meshFolder.add(meshParams, 'buildingHeight', 100, 1000).step(10).onChange((value) => {
        modelList.forEach((item, index) => {
          item.mesh && item.mesh.position.set(0, value * index - 265, 0)
        })

        boxGeometrys.forEach((item, index) => {
          item.position.set(item.position.x, boxGeometrysHeightRatios[index] * value * (modelList.length - 1) - 265, item.position.z)
        })

        localWrite('buildingHeight', value)
        updateSplineOutline();
      })
      // 连接线
      let connectlineFolder = gui.addFolder("connect line");
      connectlineFolder.add(connectlineParams, 'uniform').onChange(() => {
        splines.uniform.mesh.visible = connectlineParams.uniform;
      });
      connectlineFolder.add(connectlineParams, 'tension', 0, 1).step(0.01).onChange(function (value) {
        splines.uniform.tension = value;
        updateSplineOutline();
        // render();
      });
      // gui.add(connectlineParams, 'centripetal').onChange(render);
      // gui.add(connectlineParams, 'chordal').onChange(render);
      // 几何体
      let updateGroupGeometry = (mesh, geometry) => {
        mesh.geometry.dispose();

        // mesh.geometry = new Three.WireframeGeometry(geometry);
        mesh.geometry = geometry;

      }
      let generateGeometry = () => {
        boxGeometrys.forEach((item) => {
          updateGroupGeometry(item, new Three.BoxGeometry(
            geometrysParams.width, geometrysParams.height, geometrysParams.depth,
          ))
        })
        localWrite("geometrysParams", geometrysParams)
      }
      let geometrysFolder = gui.addFolder('geometrys');
      geometrysFolder.add(geometrysParams, 'width', 1, 30).onChange(generateGeometry);
      geometrysFolder.add(geometrysParams, 'height', 1, 30).onChange(generateGeometry);
      geometrysFolder.add(geometrysParams, 'depth', 1, 30).onChange(generateGeometry);
      geometrysFolder.add(geometrysParams, 'isshow',).onChange((value) => {
        if (value) {
          boxGeometrys.forEach((item) => {
            group.add(item)
          })
        } else {
          boxGeometrys.forEach((item) => {
            group.remove(item)
          })
        }
        scene.add(group)
      });
      geometrysFolder.add(geometrysParams, 'ismove').onChange((value) => {
        !value && transformControl.detach();
      }
      )
      gui.open();
    }

    // 自定义 可视化控制
    let onChangeShowFloor = (item, isshow) => {
      // 控制显示 楼层
      switch (item.type) {
        case "floor":
          floorParams.value.forEach((val) => {
            if (item.name === val.name) {
              val.show = false
            } else {
              val.show = true
            }
          })
          modelList.forEach((val) => {
            if (item.name === val.name) {
              val.show = false
            } else {
              val.show = true
            }

            if (val.show !== undefined && !val.show) {
              group.add(val.mesh)
            } else {
              group.remove(val.mesh)
            }
          })
          scene.add(group)
          break;
        case "rotate":
          item.show = isshow
          if (!isshow) {
            function anima() {
              if (group) {
                group.rotation.y += 0.015;
              }

              renderer && renderer.render(scene, camera);
              animationID = requestAnimationFrame(anima);
            }
            anima()
          } else {
            cancelAnimationFrame(animationID)
          }
          break;
        case "move":
          item.show = isshow
          geometrysParams.ismove = !isshow
          isshow && transformControl.detach();
          break
        case "reset":
          group.rotation.y = 0;
          camera.position.set(1200, 600, -1200);
          camera.lookAt(scene.position);
          break
        default:
          break;
      }
      // 控制旋转

    }

    // 全部显示
    let onShowFloor = () => {
      floorParams.value.forEach((val) => {
        val.show = true
      })
      modelList.forEach((val) => {
        group.add(val.mesh)
      })
      scene.add(group)
    }

    // 点击下箭头
    let onDown = () => {
      if (curIndex.value === modelList.length - 5 || modelList.length < 5) return
      curIndex.value++
      floorView.value.style.transform = `translateY(-${40 * curIndex.value}px)`;
    }
    // 点击上箭头
    let onUp = () => {
      if (curIndex.value === 0) return
      curIndex.value--
      floorView.value.style.transform = `translateY(-${40 * curIndex.value}px)`;
    }
    // 设置楼高
    let onChangeHeight = (number, type) => {
      if ((meshParams.buildingHeight === 100 && type === 'down') || (meshParams.buildingHeight === 800 && type === 'up')) return
      meshParams.buildingHeight += number

      modelList.forEach((item, index) => {
        item.mesh && item.mesh.position.set(0, meshParams.buildingHeight * index - 265, 0)
      })

      boxGeometrys.forEach((item, index) => {//4 = 代表楼层总层数 -1  265 = 模型下移距离
        item.position.set(item.position.x, boxGeometrysHeightRatios[index] * meshParams.buildingHeight * (modelList.length - 1) - 265, item.position.z)
      })
      localWrite('buildingHeight', meshParams.buildingHeight)
      updateSplineOutline();
    }

    let addSplineObject = (position, data) => {
      const material = new Three.MeshLambertMaterial({ color: data != undefined && typeof data.typeName === 'string' ? 0xff0000 : 0x00ff00 });
      const object = new Three.Mesh(geometry, material);
      boxGeometrys.push(object)
      object.sectionBusWay = data;
      if (position) {
        object.position.copy(position);
      } else {
        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;
      }
      boxGeometrysHeightRatios.push((object.position.y + 265) / (meshParams.buildingHeight * (modelList.length - 1)))
      object.castShadow = true;
      object.receiveShadow = true;
      group.add(object)
      return object;
    }

    let updateSplineOutline = () => {
      for (const k in splines) {
        const spline = splines[k];
        const splineMesh = spline.mesh;
        const position = splineMesh.geometry.attributes.position;
        for (let i = 0; i < ARC_SEGMENTS; i++) {
          const t = i / (ARC_SEGMENTS - 1);
          spline.getPoint(t, point);
          position.setXYZ(i, point.x, point.y, point.z);
        }
        position.needsUpdate = true;
      }
    }

    // 窗口自适应
    const resize = () => {
      window.addEventListener('resize', () => {
        // 初始化摄像机
        camera && (camera.aspect = model_box.value.clientWidth / model_box.value.clientHeight);
        camera && camera.updateProjectionMatrix(); // 初始化渲染器尺寸
        renderer && renderer.setSize(model_box.value.clientWidth, model_box.value.clientHeight);
        // render()
      });
    };
    // 监听 模型容器 元素宽度
    let monitorModelContainer = () => {
      // 创建实例
      erd = elementResizeDetectorMaker();
      //监听id为test的元素 大小变化
      erd.listenTo(model_box.value, function (element) {
        nextTick(() => {
          // 初始化摄像机
          camera && (camera.aspect = element.clientWidth / element.clientHeight);
          camera && camera.updateProjectionMatrix(); // 初始化渲染器尺寸
          renderer && renderer.setSize(element.clientWidth, element.clientHeight);
        })
      });
    }
    // 用户交互
    let interfaceObj = {
      // 用户 点击
      selectObject: (event) => {
        event.preventDefault();
        if (event.button != 0) return;
        // const mousedown = new Three.Vector3();
        if (model_box.value) {
          mousedown.x = (event.offsetX / model_box.value.clientWidth) * 2 - 1; // window.innerWidth event.clientX
          mousedown.y = -(event.offsetY / model_box.value.clientHeight) * 2 + 1; // window.innerHeight event.clientY
        }

        const raycaster = new Three.Raycaster();
        raycaster.setFromCamera(mousedown, camera);

        const intersected = raycaster.intersectObjects(
          boxGeometrys,
          false
        );
        if (intersected.length) {
          const found = intersected[0];

          onDownPosition.x = event.offsetX;
          onDownPosition.y = event.offsetX;
          if (found.object.sectionBusWay !== undefined && !geometrysParams.ismove) {
            STORE.commit("setBuswaryInfo", found.object.sectionBusWay);
            componentName.value = "node";
          }
          // found.object.material.color.set(0xff0000);
        }
      },
      // 用户 鼠标移动
      pointermove: (event) => {
        event.preventDefault();
        // if (event.button != 0) return;

        // const mousemove = new Three.Vector3();
        if (model_box.value) {
          mousemove.x = (event.offsetX / model_box.value.clientWidth) * 2 - 1; //event.clientX
          mousemove.y = -(event.offsetY / model_box.value.clientHeight) * 2 + 1; //event.clientY
        }

        const raycaster = new Three.Raycaster();
        raycaster.setFromCamera(mousemove, camera);

        const intersected = raycaster.intersectObjects(
          boxGeometrys,
          false
        );
        if (intersected.length > 0) {
          INTERSECTED = intersected[0].object;
          if (geometrysParams.ismove) {
            if (INTERSECTED !== transformControl.object) {
              transformControl.attach(INTERSECTED);
            }
          }
          document.querySelector('body').style.cursor = 'pointer'
        } else {
          document.querySelector('body').style.cursor = ''
        }
      },
      onPointerUp: (event) => {
        event.preventDefault();
        // if (event.button != 0) return;

        // const mousemove = new Three.Vector3();
        if (model_box.value) {
          mousemove.x = (event.offsetX / model_box.value.clientWidth) * 2 - 1; //event.clientX
          mousemove.y = -(event.offsetY / model_box.value.clientHeight) * 2 + 1; //event.clientY
        }

        const raycaster = new Three.Raycaster();
        raycaster.setFromCamera(mousemove, camera);

        const intersected = raycaster.intersectObjects(
          boxGeometrys,
          false
        );

        if (intersected.length > 0) {
          INTERSECTED = intersected[0].object;
          onUpPosition.x = event.offsetX;
          onUpPosition.y = event.offsetY;
          if (onDownPosition.distanceTo(onUpPosition) === 0) transformControl.detach();
        } else {
          transformControl.detach();
        }
      },
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
      // initGUI(); //初始化GUI
      createCamera(); // 创建相机
      createLight(); // 创建光源
      createRender(); // 创建渲染器
      createControls(); // 创建控件对象
      render(); // 渲染
      resize(); // 自适应
    };

    onMounted(() => {
      let stop = watch(
        () => props.markingList, () => {
          init()
          // initBoxGeometrys()
          model_box.value.addEventListener('pointerdown', interfaceObj.selectObject);
          model_box.value.addEventListener("pointermove", interfaceObj.pointermove);
          model_box.value.addEventListener("pointerup", interfaceObj.onPointerUp);
          stop()
        },
        {
          deep: true
        }
      )
      // 根据实时数据实时改变几何体颜色
      watch(
        () => props.markingList, (newVal) => {
          boxGeometrys.forEach((item) => {
            newVal.forEach((val) => {
              if (item.sectionBusWay.sectionBusWayId === val.sectionBusWayId) {
                if (val.typeName) {
                  item.material.color.set(0xff0000);
                } else {
                  item.material.color.set(0x00ff00);
                }
              }
            })
          })
        },
        {
          deep: true
        }
      )
      monitorModelContainer();

      axios.get("config/index.json").then((res) => {
        modelList = res.data.MODEL_LIST
        modelList.forEach((item) => {
          meshParams[item.name] = true
        })
        modelList.forEach((item, index) => {
          floorParams.value.unshift({
            id: index + 4,
            name: item.name,
            show: true,
            type: "floor"
          })
        })
      })
    })

    onBeforeUnmount(() => {
      model_box.value.removeEventListener('pointerdown', interfaceObj.selectObject)
      model_box.value.removeEventListener('pointermove', interfaceObj.pointermove)
      model_box.value.removeEventListener('pointerup', interfaceObj.onPointerUp)
      erd.removeAllListeners(model_box.value);
    })

    // 缓存 执行周期函数
    onActivated(() => {
      // initGUI();
    })
    onDeactivated(() => {
      // document.querySelector('.lil-gui').remove()
    })

    onUnmounted(() => {
      // removeCube();
      removeCube();
    })

    return {
      model_box,
      floorParams,
      meshParams,
      onChangeShowFloor,
      floorView,
      onShowFloor,
      onDown,
      onUp,
      onChangeHeight
    }
  }
})
</script>

<style lang="scss" scoped>
/deep/ .el-main {
  padding: 0 !important;
}
.container_three {
  width: 100%;
  position: relative;
  height: calc(100vh - 80px);
  .model_box {
    width: 100%;
  }

  .treeView {
    position: absolute;
    background-color: #ffffff;
    box-shadow: 2px 2px 8px 0 #b8b7bc;
    right: 20px;
    top: 10px;
    width: 40px;
    border-radius: 4px;
    max-height: calc(100vh - 120px);
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0;
    }
    .treeView-top {
      padding-top: 5px;
      text-align: center;
      margin-bottom: 20px;
      .d-logo {
        width: 28px;
      }
      .level-logo {
        width: 24px;
        cursor: pointer;
      }
      p {
        font-size: 12px;
        font-weight: bold;
        color: #21253a;
        margin-bottom: 20px;
      }
    }
    .treeView-main {
      width: 100%;
      text-align: center;
      .floorViewbox {
        max-height: 200px;
        overflow: hidden;
      }
      .floorView {
        transition: all 1s;
        .floor {
          width: 100%;
          height: 40px;
          line-height: 40px;
          font-size: 16px;
          padding: 0 5px;
          font-weight: bold;
          cursor: pointer;
          div {
            border-bottom: 2px solid #dbdbdb;
          }
        }
        .active {
          background-color: lightblue;
        }
        & li:last-child {
          div {
            border-bottom: none;
          }
        }
      }
      .up-arrow,
      .down-arrow,
      .floorIcon {
        width: 16px;
        cursor: pointer;
      }

      .buildingHeight {
        margin-top: 10px;
        input {
          width: 56%;
          border-radius: 4px;
          box-shadow: 0 0 8px 0 #b8b7bc;
        }
      }
    }
  }
}
</style>