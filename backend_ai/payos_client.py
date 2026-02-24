"""
PayOS Payment Integration Client
Documentation: https://payos.vn/docs/api
"""
import hmac
import hashlib
import time
import requests
import os
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()


class PayOSClient:
    """Client for PayOS payment gateway integration."""
    
    def __init__(self):
        self.client_id = os.getenv("PAYOS_CLIENT_ID")
        self.api_key = os.getenv("PAYOS_API_KEY")
        self.checksum_key = os.getenv("PAYOS_CHECKSUM_KEY")
        self.base_url = "https://api-merchant.payos.vn"
        
        if not all([self.client_id, self.api_key, self.checksum_key]):
            raise ValueError("PayOS credentials not configured. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY in .env")
    
    def _create_signature(self, data: str) -> str:
        """Create HMAC SHA256 signature for PayOS request."""
        return hmac.new(
            self.checksum_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def create_payment_link(
        self,
        order_code: int,
        amount: int,
        description: str,
        return_url: str,
        cancel_url: str,
        buyer_name: Optional[str] = None,
        buyer_email: Optional[str] = None,
        buyer_phone: Optional[str] = None
    ) -> Dict:
        """
        Create payment link for subscription.
        
        Args:
            order_code: Unique order code (integer)
            amount: Amount in VND
            description: Payment description
            return_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment
            buyer_name: Optional buyer name
            buyer_email: Optional buyer email
            buyer_phone: Optional buyer phone
            
        Returns:
            Dict with payment_url, order_code, and other info
        """
        # Create payment data
        payment_data = {
            "orderCode": order_code,
            "amount": amount,
            "description": description,
            "returnUrl": return_url,
            "cancelUrl": cancel_url
        }
        
        # Add buyer info if provided
        if buyer_name or buyer_email or buyer_phone:
            payment_data["buyerName"] = buyer_name or ""
            payment_data["buyerEmail"] = buyer_email or ""
            payment_data["buyerPhone"] = buyer_phone or ""
        
        # Create signature
        signature_data = f"amount={amount}&cancelUrl={cancel_url}&description={description}&orderCode={order_code}&returnUrl={return_url}"
        signature = self._create_signature(signature_data)
        
        # Make API request
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payment_data["signature"] = signature
        
        response = requests.post(
            f"{self.base_url}/v2/payment-requests",
            json=payment_data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"PayOS API error: {response.text}")
        
        result = response.json()
        return {
            "payment_url": result["data"]["checkoutUrl"],
            "order_code": result["data"]["orderCode"],
            "qr_code": result["data"]["qrCode"],
        }
    
    def get_payment_info(self, order_code: int) -> Dict:
        """
        Get payment information by order code.
        
        Args:
            order_code: Order code to query
            
        Returns:
            Dict with payment status and details
        """
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
        }
        
        response = requests.get(
            f"{self.base_url}/v2/payment-requests/{order_code}",
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"PayOS API error: {response.text}")
        
        result = response.json()
        return result["data"]
    
    def verify_webhook_signature(self, webhook_data: Dict) -> bool:
        """
        Verify webhook signature from PayOS.
        
        Args:
            webhook_data: Webhook data received from PayOS
            
        Returns:
            True if signature is valid, False otherwise
        """
        received_signature = webhook_data.get("signature", "")
        
        # Create signature from data
        data = webhook_data.get("data", {})
        signature_string = (
            f"amount={data.get('amount')}&"
            f"code={data.get('code')}&"
            f"desc={data.get('desc')}&"
            f"orderCode={data.get('orderCode')}&"
            f"status={data.get('status')}"
        )
        
        calculated_signature = self._create_signature(signature_string)
        
        return hmac.compare_digest(received_signature, calculated_signature)
    
    def cancel_payment(self, order_code: int, reason: Optional[str] = None) -> Dict:
        """
        Cancel a payment request.
        
        Args:
            order_code: Order code to cancel
            reason: Optional cancellation reason
            
        Returns:
            Dict with cancellation result
        """
        headers = {
            "x-client-id": self.client_id,
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        data = {}
        if reason:
            data["cancellationReason"] = reason
        
        response = requests.post(
            f"{self.base_url}/v2/payment-requests/{order_code}/cancel",
            json=data,
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"PayOS API error: {response.text}")
        
        return response.json()


# Subscription plans configuration
SUBSCRIPTION_PLANS = {
    "normal": {
        "name": "Normal",
        "price": 99000,  # 99,000 VND
        "duration_days": 30,
        "features": [
            "Truy cập đầy đủ các tính năng cơ bản",
            "Phân tích tài liệu PDF",
            "Chat với AI",
            "Lưu trữ tối đa 50 tài liệu",
        ]
    },
    "pro": {
        "name": "Pro",
        "price": 199000,  # 199,000 VND
        "duration_days": 30,
        "features": [
            "Tất cả tính năng Normal",
            "Phân tích blueprint chi tiết",
            "Ưu tiên xử lý",
            "Lưu trữ không giới hạn",
            "Hỗ trợ ưu tiên 24/7",
        ]
    }
}


def get_plan_info(plan: str) -> Optional[Dict]:
    """Get subscription plan information."""
    return SUBSCRIPTION_PLANS.get(plan)
