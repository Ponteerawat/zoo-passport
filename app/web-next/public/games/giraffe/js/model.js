let model;

// Scene setup
const scene = new THREE.Scene();

/**
 * Field of View (FOV): 75
 * เป็นขอบเขตการมองเห็นในแนวตั้ง (เป็นองศา) 
 * ซึ่งจะกำหนดว่ามุมมองของกล้องกว้างแค่ไหน ค่าที่มากขึ้นหมายถึงมุมมองที่กว้างขึ้น
 * 
 * Aspect Ratio (อัตราส่วนภาพ)
 * ค่านี้จะกำหนดอัตราส่วนระหว่างความกว้างและความสูงของมุมมองของกล้อง 
 * โดยปกติแล้วจะตั้งค่าให้ตรงกับอัตราส่วนภาพของจอแสดงผลหรือ canvas
 * 
 * Near Clipping Plane (ระนาบตัดภาพใกล้)
 * คือระยะห่างขั้นต่ำจากกล้องที่สามารถเรนเดอร์วัตถุได้ 
 * หากวัตถุใดอยู่ใกล้กว่าระยะนี้จะไม่สามารถมองเห็นได้
 * 
 * Far Clipping Plane (ระนาบตัดภาพไกล)
 * นี่คือระยะห่างสูงสุดจากกล้องที่สามารถแสดงวัตถุได้ 
 * หากระยะห่างเกินกว่านี้จะไม่สามารถมองเห็นได้
 * 
*/
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

/**
 * 
 * THREE.WebGLRenderer(): 
 * คำสั่งนี้จะสร้างโปรแกรมเรนเดอร์ที่จะใช้ในการเรนเดอร์ฉาก 3 มิติลงบนองค์ HTML <canvas> 
 * โดยใช้ WebGL ซึ่งเป็น JavaScript API สำหรับการเรนเดอร์กราฟิก 3 มิติ
 * 
 * { antialias: true }: นี่คือตัวเลือกที่ส่งเป็นอ็อบเจกต์ไปยังคอนสตรัคเตอร์ของตัวเรนเดอร์ 
 * ซึ่งจะเปิดใช้งาน antialiasing ซึ่งเป็นเทคนิคที่ใช้ในการปรับขอบหยักให้เรียบ 
 * เมื่อตั้งค่า antialias เป็น true การเรนเดอร์จะดูเรียบเนียนขึ้น โดยเฉพาะที่ขอบของอ็อบเจกต์
 * 
*/
const renderer = new THREE.WebGLRenderer({ antialias: true });

/**
 * renderer setup: pixel ratio and sizing for responsiveness
 */
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // White background
// ensure canvas fills available space
renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Lighting
/**
 * THREE.AmbientLight(): 
 * จะสร้างแสงโดยรอบซึ่งจะส่องสว่างวัตถุทั้งหมดอย่างเท่าเทียมกัน 
 * โดยไม่คำนึงถึงตำแหน่งหรือทิศทางในฉาก โดยไม่ทำให้เกิดเงา เนื่องจากแสงนี้ไม่มีทิศทาง
 * 
*/
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

/**
 * THREE.DirectionalLight():
 * สิ่งนี้จะสร้างแสงที่มีทิศทางซึ่งจำลองแสงแดดหรือแหล่งกำเนิดแสงอื่น ๆ 
 * ที่ปล่อยแสงขนานกัน โดยจะส่องแสงไปยังวัตถุจากทิศทางที่กำหนด
 * 
*/
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(1.5, 1.5, 1.5)
scene.add(directionalLight)

// RGBELoader to make our model more realistic lighting
/**
 * THREE.RGBELoader()
 * เป็นคลาสใน Three.js ที่ใช้โหลดภาพ HDR ในรูปแบบ RGBE 
 * ภาพ HDR มีข้อมูลแสงที่ละเอียดกว่าเมื่อเทียบกับภาพมาตรฐาน 
 * ซึ่งทำให้เหมาะอย่างยิ่งสำหรับการใช้เป็นแผนที่สภาพแวดล้อมหรือสกายบ็อกซ์ในฉาก 3 มิติ
 * 
*/
const hdriLoader = new THREE.RGBELoader()
hdriLoader.load('hdri/lonely_road_afternoon_puresky_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;
});

// Load the 3D model
const loader = new THREE.GLTFLoader();
loader.load('models/scene.gltf', function (gltf) {
    model = gltf.scene;
    // Reset scale and auto-fit model to viewport
    model.scale.set(1, 1, 1);
    scene.add(model);

    // Compute bounding box, auto-scale and center model
    let bbox = new THREE.Box3().setFromObject(model);
    let size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
        const desiredSize = 2.0; // target world-space size
        const s = desiredSize / maxDim;
        model.scale.set(s, s, s);
    }

    // Recompute box after scaling and center model at origin
    bbox = new THREE.Box3().setFromObject(model);
    const center = bbox.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Fit camera to model
    const boxSize = bbox.getSize(new THREE.Vector3());
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(Math.max(boxSize.x, boxSize.y, boxSize.z) / 2 / Math.tan(fov / 2)) * 1.5;
    camera.position.set(0, boxSize.y * 0.5, cameraZ);
    camera.near = Math.max(0.1, cameraZ / 100);
    camera.far = cameraZ * 100;
    camera.updateProjectionMatrix();

    // Ensure controls look at the model center
    controls.target.set(0, 0, 0);
    controls.update();

    renderer.render(scene, camera);

}, undefined, function (error) {
    console.error(error);
});

// Camera position
// camera.position.set(0, 1, 5); // Default Position the camera further back along the z-axis
camera.position.set(2, 2, 5); // Adjust these values as needed

// Animation loop
function animate() {
    /**
     * requestAnimationFrame(animate):
     * วิธีนี้จะแจ้งให้เบราว์เซอร์เรียกใช้ฟังก์ชัน animate ก่อนมีการใส่สีใหม่ในครั้งต่อไป 
     * เพื่อสร้างลูปแอนิเมชันที่ราบรื่น ซึ่งจะช่วยเพิ่มประสิทธิภาพการเรนเดอร์
     * โดยซิงค์แอนิเมชันกับอัตราการรีเฟรชของจอภาพ
    */
    requestAnimationFrame(animate);

    /**
     * controls.update():
     * หากใช้ไลบรารีควบคุม (เช่น OrbitControls) 
     * คำสั่งนี้จะอัปเดตการควบคุมสำหรับกล้อง โดยจะประมวลผลอินพุตของผู้ใช้ 
     * เช่น การเคลื่อนไหวของเมาส์หรือการสัมผัส 
     * ซึ่งช่วยในเรื่องการนำทางการโต้ตอบใน sceneได้
    */
    controls.update();

    if (model) {
        // Spin slowly around the x-axis
        model.rotation.y += 0.001;
        // Keep the camera focused on the model ( cannot right click )
        camera.lookAt(model.position);
    }

    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    /**
     * คำสั่งนี้จะอัปเดตอัตราส่วนภาพของกล้องให้ตรงกับขนาดใหม่ของหน้าต่าง 
     * อัตราส่วนภาพคืออัตราส่วนของความกว้างต่อความสูง 
     * และช่วยให้แน่ใจว่าฉากจะแสดงอย่างถูกต้องโดยไม่เกิดการบิดเบือน
     * 
    */
    camera.aspect = window.innerWidth / window.innerHeight;

    /**
     * หลังจากเปลี่ยนอัตราส่วนภาพ คำสั่งนี้จะอัปเดตเมทริกซ์การฉายภาพของกล้อง 
     * ซึ่งจำเป็นต่อการใช้อัตราส่วนภาพใหม่ และเพื่อให้แน่ใจว่าการแสดงผลจะดูถูกต้อง
     * 
    */
    camera.updateProjectionMatrix();

    /**
     * คำสั่งนี้จะปรับขนาดเอาต์พุตของแคนวาสของโปรแกรมเรนเดอร์ให้ตรงกับขนาดหน้าต่างใหม่ 
     * เพื่อให้แน่ใจว่าฉากจะถูกเรนเดอร์อย่างถูกต้องภายในหน้าต่างที่ปรับขนาดแล้ว
    */
    renderer.setSize(window.innerWidth, window.innerHeight);
});
