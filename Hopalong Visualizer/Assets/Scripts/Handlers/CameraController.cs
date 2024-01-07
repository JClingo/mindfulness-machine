using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.XR.Interaction.Toolkit;

[RequireComponent(typeof(GameObject))]
public class CameraController : MonoBehaviour
{

    public InputActionReference inputActionPosition = null;

    public GameObject lookAtObject;
    public float slerpSpeed;
    public float lerpSpeed;

    void Start()
    {
        
    }

    void Update()
    {
        AdjustCamera();
    }

    private void AdjustCamera()
    {
        Vector2 value = inputActionPosition.action.ReadValue<Vector2>();
        //if (value.x != 0)
        //{
        //    transform.position = Vector3.Lerp(transform.position, transform.position * value * 800, lerpSpeed * Time.deltaTime);
        //}
        

        transform.position = value * 800;

        Quaternion targetRotation = Quaternion.LookRotation(lookAtObject.transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, slerpSpeed * Time.deltaTime);

        //transform.LookAt(lookAtObject.transform);
        
        
    }


}
