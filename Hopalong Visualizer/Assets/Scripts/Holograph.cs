using System.Collections;
using System.Collections.Generic;
using System.Security.Cryptography;
using Unity.Jobs;
using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;

[RequireComponent(typeof(MeshFilter))]
[RequireComponent(typeof(MeshRenderer))]
public class Holograph : MonoBehaviour
{

    public float speed;
    public float rotationSpeed;
    public float rotationSmooth;
    private bool looping = false;

    private Color32[] meshColors;


    private Navigator parent;

    


    // Start is called before the first frame update
    void Start()
    {
        
    }

    public void Initialize(int level, Mesh generatedMesh)
    {

        parent = transform.parent.GetComponent<Navigator>();

        //transform.position = new Vector3(0, 0, -GLOBALS.LEVEL_DEPTH * level - (j - GLOBALS.LEVEL_DEPTH / GLOBALS.NUM_SUBSETS) + GLOBALS.SCALE_FACTOR / 2);
        transform.position = new Vector3(0, 0, GLOBALS.LEVEL_DEPTH * level);

        Mesh mesh = Instantiate(generatedMesh);

        Color meshColor = Random.ColorHSV(0f, 1f, 1f, 1f, 0.5f, 1f, 0.5f, 0.5f);
        meshColors = new Color32[mesh.vertices.Length];
        System.Array.Fill(meshColors, meshColor);
        mesh.SetColors(meshColors);
        GetComponent<MeshFilter>().mesh = mesh;
        //mesh.RecalculateNormals();

        //GenerateMesh();


        
    }

    // Update is called once per frame
    void Update()
    {
        
        transform.position -= new Vector3(0, 0, speed * Time.deltaTime);   

        transform.Rotate(Vector3.forward * Time.deltaTime * rotationSpeed);
        //transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * rotationSmooth);
        // if we've reached the edge of our space
        
        if (transform.localPosition.z <= -(GLOBALS.CAMERA_BOUND))
        {
            if (!looping)
            {

                looping = true;
                

                StartCoroutine(EndCycle());
            }


           

        }

        
    }

    



    public IEnumerator EndCycle()
    {
        //Material testMaterial = GetComponent<Renderer>().material;
        //while (GetComponent<Renderer>().material.color.a > 0)
        //{
        //    Color objectColor = GetComponent<Renderer>().material.color;
        //    float fadeAmount = objectColor.a - (speed * Time.deltaTime / 10);
        //    objectColor = new Color(objectColor.r, objectColor.g, objectColor.b, fadeAmount);
        //    GetComponent<Renderer>().material.color = objectColor;
        //    yield return null;
        //}
        // move to the other end
        transform.position = new Vector3(0, 0, GLOBALS.CAMERA_BOUND);

        // get latest vertices


        //Mesh mesh = Instantiate(parent.mesh);

        Mesh mesh = GetComponent<MeshFilter>().mesh;

        Color32 meshColor = Random.ColorHSV(0f, 1f, 1f, 1f, 0.5f, 1f, 0.5f, 0.5f);
        meshColors = new Color32[mesh.vertices.Length];
        System.Array.Fill(meshColors, meshColor);
        
        mesh.vertices = parent.mesh.vertices;
        mesh.triangles = parent.mesh.triangles;
        mesh.SetColors(meshColors);

        GetComponent<MeshFilter>().mesh = mesh;





        //mesh.RecalculateNormals();

        looping = false;

        // generate a new mesh from the latest vertex/color data
        //GenerateMesh();

        //foreach (Transform pointCloud in transform)
        //{
        //    //PointCloud script = pointCloudClone.GetComponent<PointCloud>();
        //    //script.Initialize(level, subsetIdx, holographVertices);



        //    PointCloud pointCloudScript = pointCloud.GetComponent<PointCloud>();
        //    int subsetIdx = pointCloudScript.subsetIdx;

        //    //Point[] points = gameObject.transform.GetComponentsInChildren<Point>();

        //    //// HACK: mixing index with points here is dangerous but it works, so...
        //    //int pointsIdx = 0;
        //    //foreach (Transform point in pointCloud.transform)
        //    //{
        //    //    Vector3 position = holographVertices.subsets[subsetIdx, pointsIdx++].vertex;
        //    //    //point.transform.localPosition = position;
        //    //    point.transform.localPosition = position;
        //    //}



        //    // re-combine meshes
        //    //pointCloudScript.ScheduleCombineMeshesJob();
        //    pointCloudScript.SetColors();

        //}






        //yield return StartCoroutine(StartCycle());

        yield return null;
        
        
    }

    //public IEnumerator StartCycle()
    //{
    //    //while (GetComponent<Renderer>().material.color.a < 1)
    //    //{
    //    //    Color objectColor = GetComponent<Renderer>().material.color;
    //    //    float fadeAmount = objectColor.a + (speed * Time.deltaTime / 10);
    //    //    objectColor = new Color(objectColor.r, objectColor.g, objectColor.b, fadeAmount);
    //    //    GetComponent<Renderer>().material.color = objectColor;
    //    //    yield return null;
    //    //}

    //    //looping = false;

    //}

    ///// <summary>
    ///// Combines the given object's children into a single mesh
    ///// </summary>
    ///// <param name="obj"></param>
    //public void CombineMeshes(GameObject obj)
    //{
    //    //Temporarily set position to zero to make matrix math easier
    //    Vector3 position = obj.transform.position;
    //    obj.transform.position = Vector3.zero;

    //    //Get all mesh filters and combine
    //    MeshFilter[] meshFilters = obj.GetComponentsInChildren<MeshFilter>();
    //    CombineInstance[] combine = new CombineInstance[meshFilters.Length];
    //    int i = 0;
    //    while (i < meshFilters.Length)
    //    {
    //        combine[i].mesh = meshFilters[i].sharedMesh;
    //        combine[i].transform = meshFilters[i].transform.localToWorldMatrix;
    //        // can't deactivate!
    //        //meshFilters[i].gameObject.SetActive(false);
    //        i++;
    //    }

    //    obj.transform.GetComponent<MeshFilter>().mesh = new Mesh();
    //    obj.transform.GetComponent<MeshFilter>().mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
    //    obj.transform.GetComponent<MeshFilter>().mesh.CombineMeshes(combine, true, true);
    //    obj.transform.gameObject.SetActive(true);

    //    //Return to original position
    //    obj.transform.position = position;

    //    //Add collider to mesh (if needed)
    //    //obj.AddComponent<MeshCollider>();
    //}
}


