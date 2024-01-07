using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.XR.Interaction.Toolkit;

[RequireComponent(typeof(InputActionReference))]
public class HolographController : MonoBehaviour
{

    public InputActionReference inputActionRotationAndSpeed = null;

    public float speed;
    public float rotationSpeed;

    void Start()
    {
        
    }

    void Update()
    {
        AdjustInputAndSpeed();
    }

    private void AdjustInputAndSpeed()
    {
        Vector2 value = inputActionRotationAndSpeed.action.ReadValue<Vector2>();
        speed = 100 + value.y * 3500;
        rotationSpeed = value.x * 600;
    }


}
