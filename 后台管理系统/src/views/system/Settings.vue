<template>
  <div class="settings">
    <el-tabs v-model="activeTab" type="card">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-card>
          <el-form :model="basicConfig" label-width="120px" v-loading="loading">
            <el-form-item label="网站名称">
              <el-input v-model="basicConfig.site_name" placeholder="请输入网站名称" />
            </el-form-item>
            <el-form-item label="网站Logo">
              <el-input v-model="basicConfig.site_logo" placeholder="请输入Logo URL" />
            </el-form-item>
            <el-form-item label="客服电话">
              <el-input v-model="basicConfig.service_phone" placeholder="请输入客服电话" />
            </el-form-item>
            <el-form-item label="客服邮箱">
              <el-input v-model="basicConfig.service_email" placeholder="请输入客服邮箱" />
            </el-form-item>
            <el-form-item label="公司地址">
              <el-input v-model="basicConfig.company_address" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="关于我们">
              <el-input v-model="basicConfig.about_us" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicConfig">保存基本设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 支付设置 -->
      <el-tab-pane label="支付设置" name="payment">
        <el-card>
          <el-form :model="paymentConfig" label-width="120px" v-loading="loading">
            <el-divider content-position="left">微信支付</el-divider>
            <el-form-item label="启用微信支付">
              <el-switch v-model="paymentConfig.wechat_enabled" />
            </el-form-item>
            <el-form-item label="AppID">
              <el-input v-model="paymentConfig.wechat_appid" placeholder="请输入微信AppID" />
            </el-form-item>
            <el-form-item label="商户号">
              <el-input v-model="paymentConfig.wechat_mchid" placeholder="请输入商户号" />
            </el-form-item>
            <el-form-item label="API密钥">
              <el-input v-model="paymentConfig.wechat_key" type="password" placeholder="请输入API密钥" />
            </el-form-item>

            <el-divider content-position="left">支付宝</el-divider>
            <el-form-item label="启用支付宝">
              <el-switch v-model="paymentConfig.alipay_enabled" />
            </el-form-item>
            <el-form-item label="AppID">
              <el-input v-model="paymentConfig.alipay_appid" placeholder="请输入支付宝AppID" />
            </el-form-item>
            <el-form-item label="私钥">
              <el-input v-model="paymentConfig.alipay_private_key" type="textarea" :rows="3" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePaymentConfig">保存支付设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 物流设置 -->
      <el-tab-pane label="物流设置" name="logistics">
        <el-card>
          <el-form :model="logisticsConfig" label-width="120px" v-loading="loading">
            <el-form-item label="默认运费">
              <el-input-number v-model="logisticsConfig.default_freight" :min="0" :precision="2" />
              <span style="margin-left: 10px; color: #999">元</span>
            </el-form-item>
            <el-form-item label="包邮金额">
              <el-input-number v-model="logisticsConfig.free_freight_amount" :min="0" :precision="2" />
              <span style="margin-left: 10px; color: #999">元（订单满此金额包邮）</span>
            </el-form-item>
            <el-form-item label="发货地址">
              <el-input v-model="logisticsConfig.ship_address" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="发件人姓名">
              <el-input v-model="logisticsConfig.sender_name" />
            </el-form-item>
            <el-form-item label="发件人电话">
              <el-input v-model="logisticsConfig.sender_phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveLogisticsConfig">保存物流设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 短信设置 -->
      <el-tab-pane label="短信设置" name="sms">
        <el-card>
          <el-form :model="smsConfig" label-width="120px" v-loading="loading">
            <el-form-item label="启用短信">
              <el-switch v-model="smsConfig.enabled" />
            </el-form-item>
            <el-form-item label="短信平台">
              <el-select v-model="smsConfig.platform" style="width: 100%">
                <el-option label="阿里云短信" value="aliyun" />
                <el-option label="腾讯云短信" value="tencent" />
              </el-select>
            </el-form-item>
            <el-form-item label="AccessKey">
              <el-input v-model="smsConfig.access_key" />
            </el-form-item>
            <el-form-item label="SecretKey">
              <el-input v-model="smsConfig.secret_key" type="password" />
            </el-form-item>
            <el-form-item label="签名">
              <el-input v-model="smsConfig.sign_name" />
            </el-form-item>
            <el-form-item label="验证码模板ID">
              <el-input v-model="smsConfig.code_template_id" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSmsConfig">保存短信设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 订单设置 -->
      <el-tab-pane label="订单设置" name="order">
        <el-card>
          <el-form :model="orderConfig" label-width="140px" v-loading="loading">
            <el-form-item label="未支付自动取消">
              <el-input-number v-model="orderConfig.unpaid_cancel_minutes" :min="1" />
              <span style="margin-left: 10px; color: #999">分钟</span>
            </el-form-item>
            <el-form-item label="发货后自动完成">
              <el-input-number v-model="orderConfig.shipped_complete_days" :min="1" />
              <span style="margin-left: 10px; color: #999">天</span>
            </el-form-item>
            <el-form-item label="完成后自动好评">
              <el-input-number v-model="orderConfig.auto_review_days" :min="1" />
              <span style="margin-left: 10px; color: #999">天</span>
            </el-form-item>
            <el-form-item label="允许退款">
              <el-switch v-model="orderConfig.allow_refund" />
            </el-form-item>
            <el-form-item label="退款审核">
              <el-switch v-model="orderConfig.refund_need_approve" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveOrderConfig">保存订单设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const activeTab = ref('basic')
const loading = ref(false)

// 基本设置
const basicConfig = reactive({
  site_name: '零食商城',
  site_logo: '',
  service_phone: '',
  service_email: '',
  company_address: '',
  about_us: ''
})

// 支付设置
const paymentConfig = reactive({
  wechat_enabled: false,
  wechat_appid: '',
  wechat_mchid: '',
  wechat_key: '',
  alipay_enabled: false,
  alipay_appid: '',
  alipay_private_key: ''
})

// 物流设置
const logisticsConfig = reactive({
  default_freight: 10,
  free_freight_amount: 99,
  ship_address: '',
  sender_name: '',
  sender_phone: ''
})

// 短信设置
const smsConfig = reactive({
  enabled: false,
  platform: 'aliyun',
  access_key: '',
  secret_key: '',
  sign_name: '',
  code_template_id: ''
})

// 订单设置
const orderConfig = reactive({
  unpaid_cancel_minutes: 15,
  shipped_complete_days: 7,
  auto_review_days: 7,
  allow_refund: true,
  refund_need_approve: true
})

// 加载配置
const loadConfig = async () => {
  loading.value = true
  try {
    const config = await request.get('/config')
    
    // 基本设置
    if (config.site_name) basicConfig.site_name = config.site_name
    if (config.site_logo) basicConfig.site_logo = config.site_logo
    if (config.service_phone) basicConfig.service_phone = config.service_phone
    if (config.service_email) basicConfig.service_email = config.service_email
    if (config.company_address) basicConfig.company_address = config.company_address
    if (config.about_us) basicConfig.about_us = config.about_us
    
    // 支付设置
    if (config.wechat_enabled !== undefined) paymentConfig.wechat_enabled = config.wechat_enabled
    if (config.wechat_appid) paymentConfig.wechat_appid = config.wechat_appid
    if (config.wechat_mchid) paymentConfig.wechat_mchid = config.wechat_mchid
    if (config.wechat_key) paymentConfig.wechat_key = config.wechat_key
    if (config.alipay_enabled !== undefined) paymentConfig.alipay_enabled = config.alipay_enabled
    if (config.alipay_appid) paymentConfig.alipay_appid = config.alipay_appid
    if (config.alipay_private_key) paymentConfig.alipay_private_key = config.alipay_private_key
    
    // 物流设置
    if (config.default_freight !== undefined) logisticsConfig.default_freight = config.default_freight
    if (config.free_freight_amount !== undefined) logisticsConfig.free_freight_amount = config.free_freight_amount
    if (config.ship_address) logisticsConfig.ship_address = config.ship_address
    if (config.sender_name) logisticsConfig.sender_name = config.sender_name
    if (config.sender_phone) logisticsConfig.sender_phone = config.sender_phone
    
    // 短信设置
    if (config.sms_enabled !== undefined) smsConfig.enabled = config.sms_enabled
    if (config.sms_platform) smsConfig.platform = config.sms_platform
    if (config.sms_access_key) smsConfig.access_key = config.sms_access_key
    if (config.sms_secret_key) smsConfig.secret_key = config.sms_secret_key
    if (config.sms_sign_name) smsConfig.sign_name = config.sms_sign_name
    if (config.sms_code_template_id) smsConfig.code_template_id = config.sms_code_template_id
    
    // 订单设置
    if (config.unpaid_cancel_minutes !== undefined) orderConfig.unpaid_cancel_minutes = config.unpaid_cancel_minutes
    if (config.shipped_complete_days !== undefined) orderConfig.shipped_complete_days = config.shipped_complete_days
    if (config.auto_review_days !== undefined) orderConfig.auto_review_days = config.auto_review_days
    if (config.allow_refund !== undefined) orderConfig.allow_refund = config.allow_refund
    if (config.refund_need_approve !== undefined) orderConfig.refund_need_approve = config.refund_need_approve
  } catch (error) {
    console.error('加载配置失败:', error)
  } finally {
    loading.value = false
  }
}

// 保存基本设置
const saveBasicConfig = async () => {
  loading.value = true
  try {
    await request.put('/config', {
      site_name: basicConfig.site_name,
      site_logo: basicConfig.site_logo,
      service_phone: basicConfig.service_phone,
      service_email: basicConfig.service_email,
      company_address: basicConfig.company_address,
      about_us: basicConfig.about_us
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 保存支付设置
const savePaymentConfig = async () => {
  loading.value = true
  try {
    await request.put('/config', {
      wechat_enabled: paymentConfig.wechat_enabled,
      wechat_appid: paymentConfig.wechat_appid,
      wechat_mchid: paymentConfig.wechat_mchid,
      wechat_key: paymentConfig.wechat_key,
      alipay_enabled: paymentConfig.alipay_enabled,
      alipay_appid: paymentConfig.alipay_appid,
      alipay_private_key: paymentConfig.alipay_private_key
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 保存物流设置
const saveLogisticsConfig = async () => {
  loading.value = true
  try {
    await request.put('/config', {
      default_freight: logisticsConfig.default_freight,
      free_freight_amount: logisticsConfig.free_freight_amount,
      ship_address: logisticsConfig.ship_address,
      sender_name: logisticsConfig.sender_name,
      sender_phone: logisticsConfig.sender_phone
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 保存短信设置
const saveSmsConfig = async () => {
  loading.value = true
  try {
    await request.put('/config', {
      sms_enabled: smsConfig.enabled,
      sms_platform: smsConfig.platform,
      sms_access_key: smsConfig.access_key,
      sms_secret_key: smsConfig.secret_key,
      sms_sign_name: smsConfig.sign_name,
      sms_code_template_id: smsConfig.code_template_id
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 保存订单设置
const saveOrderConfig = async () => {
  loading.value = true
  try {
    await request.put('/config', {
      unpaid_cancel_minutes: orderConfig.unpaid_cancel_minutes,
      shipped_complete_days: orderConfig.shipped_complete_days,
      auto_review_days: orderConfig.auto_review_days,
      allow_refund: orderConfig.allow_refund,
      refund_need_approve: orderConfig.refund_need_approve
    })
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.settings {
  :deep(.el-tabs__content) {
    padding: 20px;
  }
  
  .el-card {
    max-width: 800px;
  }
}
</style>