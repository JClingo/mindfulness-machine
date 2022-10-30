using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.XR.Interaction.Toolkit;

public class HolographController : MonoBehaviour
{

    public InputActionReference inputActions = null;

    public float speed;
    public float rotationSpeed;

    //private void OnEnable()
    //{
    //    inputActions.Enable();
    //}

    //private void OnDisable()
    //{
    //    inputActions.Disable();
    //}

    private void Awake()
    {
        //inputActions = new XRIDefaultInputActions();


    }

    private void Move(InputAction.CallbackContext context)
    {
      
    }

    void Start()
    {
        
    }

    void Update()
    {
        Vector2 value = inputActions.action.ReadValue<Vector2>();
        if (value.x > 0 || value.y > 0)
        {
            print(value);
        }
        speed = 100 + value.y * 3500;
        rotationSpeed = value.x * 600;
    }



}
